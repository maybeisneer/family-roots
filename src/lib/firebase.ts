import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import type { Interview, SuggestedQuestion, Response } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(), // Trim any whitespace/newlines
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const storage = getStorage(app); // Uses storageBucket from config
export const auth = getAuth(app);

// Initialize Analytics (client-side only)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('🔥 Firebase Analytics initialized');
    }
  });
}

// Analytics helper functions
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

// Debug: Log storage bucket on init
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Storage bucket:', firebaseConfig.storageBucket);
}

// Auth Helpers
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Collection references
const interviewsCollection = collection(db, 'interviews');
const questionsCollection = collection(db, 'questions');
const responsesCollection = collection(db, 'responses');

// Helper to generate codes
function generateCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Interview operations
export async function createInterview(data: Partial<Interview> & { questions?: string[]; organizer_id?: string }): Promise<Interview> {
  const docRef = doc(interviewsCollection);
  
  const interview_link_code = data.interview_link_code || generateCode();
  const playback_link_code = data.playback_link_code || generateCode();
  
  const interview: Interview & { organizer_id?: string } = {
    id: docRef.id,
    status: 'ready',
    organizer_name: data.organizer_name || '',
    organizer_email: data.organizer_email,
    interviewee_name: data.interviewee_name || '',
    interviewee_age: data.interviewee_age,
    relationship: data.relationship || '',
    birthplace: data.birthplace || '',
    current_location: data.current_location,
    language: data.language || 'en',
    interview_link_code,
    playback_link_code,
    created_at: new Date().toISOString(),
    organizer_id: data.organizer_id
  };
  
  await setDoc(docRef, interview);

  // Create suggested questions if provided
  if (data.questions && data.questions.length > 0) {
    const suggestedQuestions: Partial<SuggestedQuestion>[] = data.questions.map((q, i) => ({
      question_text: q,
      priority_order: i,
      is_custom: false,
      was_asked: false,
    }));
    await createSuggestedQuestions(interview.id, suggestedQuestions);
  }

  return interview;
}

export async function getInterviewsByOrganizer(organizerId: string): Promise<Interview[]> {
  // Query without orderBy to avoid needing a composite index
  // Sort client-side instead
  const q = query(interviewsCollection, where('organizer_id', '==', organizerId));
  const snapshot = await getDocs(q);
  const interviews = snapshot.docs.map(doc => doc.data() as Interview);
  // Sort by created_at descending (newest first)
  return interviews.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getInterviewByCode(code: string): Promise<(Interview & { questions?: SuggestedQuestion[]; responses?: Response[] }) | null> {
  // Try interview_link_code first
  let q = query(interviewsCollection, where('interview_link_code', '==', code));
  let snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Try playback_link_code
    q = query(interviewsCollection, where('playback_link_code', '==', code));
    snapshot = await getDocs(q);
  }
  
  if (snapshot.empty) return null;
  
  const interview = snapshot.docs[0].data() as Interview;
  
  // Fetch questions and responses
  const [questions, responses] = await Promise.all([
    getQuestionsByInterviewId(interview.id),
    getResponsesByInterviewId(interview.id)
  ]);
  
  return {
    ...interview,
    questions,
    responses
  };
}

export async function getInterviewById(id: string): Promise<(Interview & { questions?: SuggestedQuestion[]; responses?: Response[] }) | null> {
  const docRef = doc(interviewsCollection, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  const interview = snapshot.data() as Interview;
  
  const [questions, responses] = await Promise.all([
    getQuestionsByInterviewId(id),
    getResponsesByInterviewId(id)
  ]);
  
  return {
    ...interview,
    questions,
    responses
  };
}

export async function updateInterview(id: string, data: Partial<Interview>): Promise<Interview> {
  const docRef = doc(interviewsCollection, id);
  await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
  
  const snapshot = await getDoc(docRef);
  return snapshot.data() as Interview;
}

export async function updateInterviewStatus(id: string, status: Interview['status']): Promise<void> {
  const docRef = doc(interviewsCollection, id);
  const data: Partial<Interview> = { status };
  
  if (status === 'completed') {
    data.completed_at = new Date().toISOString();
  }
  
  await updateDoc(docRef, data);
}

// Question operations
export async function createSuggestedQuestions(interviewId: string, questions: Partial<SuggestedQuestion>[]): Promise<SuggestedQuestion[]> {
  const results: SuggestedQuestion[] = [];
  
  for (const question of questions) {
    const docRef = doc(questionsCollection);
    const q = {
      ...question,
      id: docRef.id,
      interview_id: interviewId,
    } as SuggestedQuestion;
    
    await setDoc(docRef, q);
    results.push(q);
  }
  
  return results;
}

export async function getQuestionsByInterviewId(interviewId: string): Promise<SuggestedQuestion[]> {
  const q = query(questionsCollection, where('interview_id', '==', interviewId));
  const snapshot = await getDocs(q);
  
  const questions = snapshot.docs.map(doc => doc.data() as SuggestedQuestion);
  return questions.sort((a, b) => a.priority_order - b.priority_order);
}

export async function updateQuestion(id: string, data: Partial<SuggestedQuestion>): Promise<SuggestedQuestion> {
  const docRef = doc(questionsCollection, id);
  await updateDoc(docRef, data);
  
  const snapshot = await getDoc(docRef);
  return snapshot.data() as SuggestedQuestion;
}

export async function deleteQuestion(id: string): Promise<void> {
  const docRef = doc(questionsCollection, id);
  await deleteDoc(docRef);
}

// Response operations
export async function createResponse(data: Partial<Response>): Promise<Response> {
  const docRef = doc(responsesCollection);
  const response = {
    ...data,
    id: docRef.id,
    created_at: new Date().toISOString(),
  } as Response;
  
  await setDoc(docRef, response);
  return response;
}

export async function getResponsesByInterviewId(interviewId: string): Promise<Response[]> {
  const q = query(responsesCollection, where('interview_id', '==', interviewId));
  const snapshot = await getDocs(q);
  
  const responses = snapshot.docs.map(doc => doc.data() as Response);
  return responses.sort((a, b) => a.order_index - b.order_index);
}

export async function updateResponse(id: string, data: Partial<Response>): Promise<Response> {
  const docRef = doc(responsesCollection, id);
  await updateDoc(docRef, data);
  
  const snapshot = await getDoc(docRef);
  return snapshot.data() as Response;
}

// Video upload to Firebase Storage with progress callback
export async function uploadVideo(
  file: Blob, 
  interviewId: string, 
  responseId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `interviews/${interviewId}/responses/${responseId}.webm`;
  console.log('📤 Uploading to Firebase Storage:', {
    bucket: storage.app.options.storageBucket,
    path,
    fileSize: file.size,
  });
  
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'video/webm',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log(`📤 Upload progress: ${progress}%`);
        onProgress?.(progress);
      },
      (error) => {
        console.error('❌ Upload failed:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('✅ Upload successful:', downloadURL);
        resolve(downloadURL);
      }
    );
  });
}

export async function getVideoUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}
