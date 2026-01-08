'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionDisplay } from '@/components/recording/QuestionDisplay';
import { BlurredVideoPreview } from '@/components/recording/BlurredVideoPreview';
import { AudioVisualizer } from '@/components/recording/AudioVisualizer';
import { RecordingControls } from '@/components/recording/RecordingControls';
import { ProcessingState } from '@/components/recording/ProcessingState';
import { CameraSetup } from '@/components/recording/CameraSetup';
import { SpeechTranscriber, isSpeechRecognitionSupported, SPEECH_LANGUAGE_CODES } from '@/lib/speech';
import { InterviewProgress } from '@/components/recording/InterviewProgress';
import { getInterviewByCode, getResponsesByInterviewId, getQuestionsByInterviewId, uploadVideo, createResponse, updateResponse, updateInterview } from '@/lib/firebase';
import { getRecordingUIStrings, type RecordingUIStrings } from '@/lib/translations';
import type { Interview as BaseInterview, SuggestedQuestion, Response } from '@/types';

// Extended Interview type with questions and responses arrays
interface Interview extends BaseInterview {
  questions: SuggestedQuestion[];
  responses: Response[];
}

type ProcessingStage = 'uploading' | 'transcribing' | 'generating';
type ScreenState = 'loading' | 'error' | 'welcome' | 'resume' | 'camera_setup' | 'recording' | 'break' | 'wrapup';

// Helper to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  // Core state
  const [interview, setInterview] = useState<Interview | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [error, setError] = useState('');
  const [uiStrings, setUiStrings] = useState<RecordingUIStrings | null>(null);
  
  // Recording state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [translatedQuestion, setTranslatedQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('uploading');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [showWrapUpSuggestion, setShowWrapUpSuggestion] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [interviewPhase, setInterviewPhase] = useState<'exploring' | 'deepening' | 'wrapping_up' | 'final'>('exploring');
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [coveragePercent, setCoveragePercent] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechTranscriberRef = useRef<SpeechTranscriber | null>(null);

  // Derived state - only count responses with successful video uploads
  const completedResponses = interview?.responses?.filter(r => r.video_url) || [];
  const totalResponses = completedResponses.length;
  const incompleteResponses = (interview?.responses?.length || 0) - totalResponses;
  const totalDuration = completedResponses.reduce((sum, r) => sum + (r.duration_seconds || 0), 0);

  // Check speech support
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  // Fetch interview data (includes any existing responses)
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        console.log('Fetching interview with code:', code);
        
        // Fetch directly from Firebase
        const interviewData = await getInterviewByCode(code);
        if (!interviewData) {
          throw new Error('Interview not found');
        }

        console.log('Interview found:', interviewData.id);

        // Fetch questions and responses
        const [questions, responses] = await Promise.all([
          getQuestionsByInterviewId(interviewData.id),
          getResponsesByInterviewId(interviewData.id),
        ]);

        console.log('Questions:', questions.length, 'Responses:', responses.length);

        // Combine data
        const data = {
          ...interviewData,
          questions: questions.sort((a, b) => a.priority_order - b.priority_order),
          responses: responses.sort((a, b) => a.order_index - b.order_index),
        };

        setInterview(data);

        // Load UI translations for the interview language (now synchronous from static files)
        const strings = getRecordingUIStrings(data.language || 'en');
        setUiStrings(strings);

        // Determine initial state based on existing responses
        const hasResponses = data.responses && data.responses.length > 0;
        const isCompleted = data.status === 'completed';
        
        if (isCompleted) {
          // Already finished, redirect to playback
          router.push(`/watch/${code}`);
          return;
        }
        
        if (hasResponses) {
          // Has existing responses - offer to resume
          setCurrentQuestionIndex(data.responses.length);
          setScreenState('resume');
        } else {
          // Fresh start
          setScreenState('welcome');
        }

        // Set first/next question
        if (hasResponses && data.questions.length > data.responses.length) {
          setCurrentQuestion(data.questions[data.responses.length].question_text);
        } else if (data.questions?.[0]) {
          setCurrentQuestion(data.questions[0].question_text);
        } else {
          setCurrentQuestion("What is your earliest memory?");
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Interview not found. Please check the link and try again.');
        setScreenState('error');
      }
    };

    fetchInterview();
  }, [code, router]);

  // Translate current question when it changes
  useEffect(() => {
    const translateQuestion = async () => {
      if (!currentQuestion) {
        setTranslatedQuestion('');
        return;
      }

      // If English or no interview, use original
      if (!interview || interview.language === 'en') {
        setTranslatedQuestion(currentQuestion);
        return;
      }

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: currentQuestion,
            targetLanguage: interview.language,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTranslatedQuestion(data.translatedText || currentQuestion);
        } else {
          setTranslatedQuestion(currentQuestion);
        }
      } catch (err) {
        console.error('Error translating question:', err);
        setTranslatedQuestion(currentQuestion);
      }
    };

    translateQuestion();
  }, [currentQuestion, interview?.language]);

  // Initialize speech transcriber
  const initSpeechTranscriber = useCallback((language: string) => {
    if (!isSpeechRecognitionSupported()) return;

    speechTranscriberRef.current = new SpeechTranscriber({
      language: SPEECH_LANGUAGE_CODES[language] || language,
      continuous: true,
      interimResults: true,
      onResult: (result) => {
        setLiveTranscript(result.transcript);
      },
      onError: (error) => {
        console.warn('Speech recognition error:', error);
      },
    });
  }, []);

  // Initialize camera/mic
  const initializeMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(mediaStream);

      if (interview?.language) {
        initSpeechTranscriber(interview.language);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera or microphone. Please grant permission and try again.');
    }
  }, [interview?.language, initSpeechTranscriber]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    setLiveTranscript('');
    setRecordingStartTime(Date.now());
    setUploadError(null);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);

    if (speechTranscriberRef.current) {
      speechTranscriberRef.current.start();
    }

    setIsRecording(true);
    setIsPaused(false);
  }, [stream]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  // Stop recording and IMMEDIATELY upload to Firebase
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !interview) return;

    setIsRecording(false);
    setIsProcessing(true);
    setProcessingStage('uploading');

    const duration = recordingStartTime 
      ? Math.round((Date.now() - recordingStartTime) / 1000) 
      : 0;

    // Stop speech transcription
    let finalTranscript = liveTranscript;
    if (speechTranscriberRef.current) {
      finalTranscript = speechTranscriberRef.current.stop();
    }

    // Stop media recorder and wait for final data
    const recorder = mediaRecorderRef.current;
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    // Create video blob
    const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });

    try {
      // 1. Create initial response record to get an ID
      const newResponseRef = await createResponse({
        interview_id: interview.id,
        question_text: currentQuestion,
        order_index: currentQuestionIndex,
        is_ai_generated: currentQuestionIndex > 0,
        duration_seconds: duration,
        transcript: finalTranscript || 'Processing...',
      });

      // 2. Upload video directly to Firebase Storage (Client-side)
      // This bypasses Vercel's 4.5MB body limit
      setUploadProgress(0);
      const videoUrl = await uploadVideo(videoBlob, interview.id, newResponseRef.id, (progress) => {
        setUploadProgress(progress);
      });

      // 3. Update response with video URL (client-side, no API needed)
      const savedResponse = await updateResponse(newResponseRef.id, {
        video_url: videoUrl,
        transcript: finalTranscript || '',
      });

      // Update interview status if needed
      if (interview.status === 'ready') {
        await updateInterview(interview.id, { status: 'in_progress' });
      }

      // Update local interview state with new response
      setInterview(prev => prev ? {
        ...prev,
        status: 'in_progress',
        responses: [...(prev.responses || []), savedResponse],
      } : null);

      setProcessingStage('transcribing');
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (err) {
      console.error('Error uploading response:', err);
      setUploadError('Failed to save your response. Please try again.');
      setIsProcessing(false);
      return;
    }

    // Generate next question (AI evaluates coverage and decides phase)
    setProcessingStage('generating');
    
    let nextQuestion = "Is there anything else you'd like to share?";
    let shouldEnd = false;
    
    try {
      const nextQuestionResponse = await fetch('/api/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewee_name: interview.interviewee_name,
          interviewee_age: interview.interviewee_age,
          birthplace: interview.birthplace,
          relationship: interview.relationship,
          language: interview.language,
          previous_responses: [...(interview.responses || []), { question: currentQuestion, transcript: finalTranscript }].map(r => ({
            question: 'question' in r ? r.question : r.question_text,
            transcript: r.transcript,
          })),
          current_transcript: finalTranscript,
        }),
      });

      if (nextQuestionResponse.ok) {
        const data = await nextQuestionResponse.json();
        nextQuestion = data.question;
        
        // Update phase tracking
        if (data.phase) setInterviewPhase(data.phase);
        if (data.coverageRatio) setCoveragePercent(data.coverageRatio);
        if (data.isLastQuestion) setIsLastQuestion(true);
        
        // AI says it's time to wrap up
        if (data.shouldWrapUp && !showWrapUpSuggestion && !data.isLastQuestion) {
          setShowWrapUpSuggestion(true);
        }
        
        // This was the final question - go to completion
        if (data.isLastQuestion && isLastQuestion) {
          shouldEnd = true;
        }
      } else {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < interview.questions.length) {
          nextQuestion = interview.questions[nextIndex].question_text;
        }
      }
    } catch (err) {
      console.error('Error generating next question:', err);
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < interview.questions.length) {
        nextQuestion = interview.questions[nextIndex].question_text;
      }
    }

    setCurrentQuestion(nextQuestion);
    setCurrentQuestionIndex(prev => prev + 1);
    setIsProcessing(false);
    setLiveTranscript('');
    setRecordingStartTime(null);

    // If AI determined this was the final question, go to completion
    if (shouldEnd) {
      setScreenState('wrapup');
    }
  }, [interview, currentQuestion, currentQuestionIndex, liveTranscript, recordingStartTime, showWrapUpSuggestion, isLastQuestion]);

  // Handle starting interview (go to camera setup first)
  const handleStart = async () => {
    await initializeMedia();
    setScreenState('camera_setup');
  };

  // Handle starting recording from camera setup
  const handleStartRecording = () => {
    setScreenState('recording');
  };

  // Handle taking a break (state already saved to Firebase)
  const handleTakeBreak = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScreenState('break');
  };

  // Handle finishing interview
  const handleFinish = () => {
    setScreenState('wrapup');
  };

  // Handle final completion
  const handleComplete = async () => {
    if (!interview) return;

    try {
      // Update interview status to completed directly via Firebase
      await updateInterview(interview.id, { status: 'completed', completed_at: new Date().toISOString() });
      console.log('✅ Interview marked as completed');
    } catch (err) {
      console.error('Error completing interview:', err);
      // Still navigate even if the status update fails
    }
    
    // Use window.location for more reliable navigation
    window.location.href = `/interview/${code}/complete`;
  };

  // Continue recording
  const handleContinue = () => {
    setShowWrapUpSuggestion(false);
  };

  // Loading state
  if (screenState === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (screenState === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">{error}</h1>
          <button onClick={() => router.push('/')} className="text-amber-500 hover:text-amber-400">
            Go back home
          </button>
        </div>
      </div>
    );
  }

  // Resume screen - shows when returning to an in-progress interview
  if (screenState === 'resume' && interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-white">
              Welcome back, {interview.interviewee_name}
            </h1>
            <p className="text-stone-400">
              Your progress has been saved
            </p>
          </div>

          <div className="p-6 bg-stone-900/50 border border-stone-800 rounded-xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Stories shared</span>
              <span className="text-white font-medium">{totalResponses}</span>
            </div>
            {incompleteResponses > 0 && (
              <div className="flex items-center justify-between text-amber-500">
                <span className="text-sm">Uploads pending</span>
                <span className="text-sm font-medium">{incompleteResponses}</span>
              </div>
            )}
          </div>

          {incompleteResponses > 0 && (
            <p className="text-amber-500/80 text-sm">
              Some recordings didn&apos;t upload. They&apos;ll be asked again when you continue.
            </p>
          )}

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
            >
              Continue Interview
            </motion.button>

            {totalResponses > 0 && (
              <button
                onClick={handleFinish}
                className="w-full py-3 text-stone-400 hover:text-white transition-colors"
              >
                I&apos;m Done Recording
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Welcome screen
  if (screenState === 'welcome' && interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-serif text-white">
              Welcome, {interview.interviewee_name}
            </h1>
            <p className="text-lg text-stone-300">
              {interview.organizer_name ? (
                <>
                  <span className="text-amber-500">{interview.organizer_name}</span> wants you to share your story for future generations
                </>
              ) : (
                'Someone in your family wants to hear your story'
              )}
            </p>
          </div>

          <div className="p-6 bg-stone-900/50 border border-stone-800 rounded-xl text-left space-y-4">
            <h2 className="font-medium text-stone-200">How this works:</h2>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-medium">1.</span>
                You&apos;ll see a question and record your answer on video
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-medium">2.</span>
                Take as much time as you need—there&apos;s no rush
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-medium">3.</span>
                Your progress is saved automatically after each response
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-medium">4.</span>
                When you&apos;re done, press &quot;Finish&quot; and your family can watch
              </li>
            </ul>
          </div>

          {!speechSupported && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left">
              <p className="text-sm text-amber-200">
                <strong>Note:</strong> Your browser doesn&apos;t support automatic transcription. 
                For the best experience, please use Chrome, Edge, or Safari.
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
          >
            I&apos;m Ready to Begin
          </motion.button>

          <p className="text-xs text-stone-600">
            We&apos;ll need access to your camera and microphone
          </p>
        </motion.div>
      </div>
    );
  }

  // Camera setup screen
  if (screenState === 'camera_setup' && interview) {
    return (
      <CameraSetup
        stream={stream}
        onStartRecording={handleStartRecording}
        intervieweeName={interview.interviewee_name}
      />
    );
  }

  // Break screen
  if (screenState === 'break' && interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-white">
              Progress Saved!
            </h1>
            <p className="text-stone-400">
              Take all the time you need. Your {totalResponses} {totalResponses === 1 ? 'response is' : 'responses are'} safely stored.
            </p>
          </div>

          <div className="p-6 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Stories shared</span>
              <span className="text-white font-medium">{totalResponses}</span>
            </div>
            <div className="pt-4 border-t border-stone-800">
              <p className="text-sm text-stone-500">
                Return to this link anytime to continue:
              </p>
              <p className="text-amber-500 text-sm mt-1 break-all">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
            >
              Continue Now
            </motion.button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 text-stone-400 hover:text-white transition-colors"
            >
              I&apos;ll Come Back Later
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Wrap-up confirmation screen
  if (screenState === 'wrapup' && interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif text-white">
              Ready to Finish?
            </h1>
            <p className="text-stone-400">
              You&apos;ve shared {totalResponses} wonderful {totalResponses === 1 ? 'story' : 'stories'}
            </p>
          </div>

          <div className="p-6 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Stories shared</span>
              <span className="text-white font-medium">{totalResponses}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left">
            <p className="text-sm text-amber-200">
              Once you finish, your family will be notified and can watch your stories together.
              You won&apos;t be able to add more after finishing.
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-medium text-lg shadow-lg shadow-green-600/25 hover:bg-green-500 transition-colors"
            >
              Yes, I&apos;m Done
            </motion.button>

            <button
              onClick={() => setScreenState('recording')}
              className="w-full py-3 text-stone-400 hover:text-white transition-colors"
            >
              No, I Want to Add More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main recording interface
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-semibold text-stone-200">Family Roots</span>
        </div>

        <div className="flex items-center gap-2">
          {totalResponses > 0 && (
            <>
              <button
                onClick={handleTakeBreak}
                className="px-4 py-2 text-sm text-stone-400 hover:text-white border border-stone-700 rounded-lg hover:border-stone-600 transition-all"
              >
                {uiStrings?.takeBreak || 'Take a Break'}
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-500 rounded-lg transition-all"
              >
                {uiStrings?.finish || 'Finish'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Wrap-up suggestion modal - AI-driven */}
      <AnimatePresence>
        {showWrapUpSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white">
                  {interviewPhase === 'final' 
                    ? "Your story is beautifully complete" 
                    : "You've shared so much"}
                </h3>
                <p className="text-stone-400 text-sm">
                  {interviewPhase === 'final' 
                    ? "You've covered your life story wonderfully. Your family will treasure these memories."
                    : `You've covered about ${coveragePercent}% of your life story. Would you like to continue or wrap up?`}
                </p>
              </div>

              {/* Coverage indicator */}
              {coveragePercent > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Story coverage</span>
                    <span>{coveragePercent}%</span>
                  </div>
                  <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${coveragePercent}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleFinish}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-500 transition-colors"
                >
                  {interviewPhase === 'final' ? "Finish & Share with Family" : "Wrap Up Interview"}
                </button>
                {interviewPhase !== 'final' && (
                  <button
                    onClick={handleContinue}
                    className="w-full py-3 text-stone-400 hover:text-white transition-colors"
                  >
                    I Have More to Share
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload error banner */}
      {uploadError && (
        <div className="mx-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {uploadError}
          <button 
            onClick={() => setUploadError(null)} 
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProcessingState stage={processingStage} uploadProgress={uploadProgress} uiStrings={uiStrings ?? undefined} />
            </motion.div>
          ) : (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl space-y-6"
            >
              {/* Progress indicator */}
              <InterviewProgress
                phase={interviewPhase}
                responseCount={totalResponses}
                coveragePercent={coveragePercent}
              />

              {/* Video preview with question overlaid */}
              <BlurredVideoPreview 
                stream={stream} 
                isRecording={isRecording}
                isPaused={isPaused}
                questionText={translatedQuestion || currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                uiStrings={uiStrings}
              />

              {/* Audio visualizer */}
              <AudioVisualizer stream={stream} isRecording={isRecording} />

              {/* Controls */}
              <div className="flex justify-center">
                <RecordingControls
                  isRecording={isRecording}
                  isPaused={isPaused}
                  onStartRecording={startRecording}
                  onPauseRecording={pauseRecording}
                  onResumeRecording={resumeRecording}
                  onStopRecording={stopRecording}
                  disabled={!stream}
                  uiStrings={uiStrings}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-stone-600">
          {totalResponses > 0 && `${totalResponses} ${totalResponses === 1 ? 'story' : 'stories'} saved • `}
          Your progress is saved automatically
        </p>
      </footer>
    </div>
  );
}
