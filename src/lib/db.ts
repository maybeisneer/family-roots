// In-memory database for development/demo
// Replace with Firebase when ready for production

import type { Interview, SuggestedQuestion, Response } from '@/types';

// In-memory storage
const interviews = new Map<string, Interview & { questions: SuggestedQuestion[]; responses: Response[] }>();

// Seed demo data
const DEMO_CODE = 'demo';
const demoInterview: Interview & { questions: SuggestedQuestion[]; responses: Response[] } = {
  id: 'demo-interview-1',
  status: 'completed',
  organizer_name: 'Sofia',
  interviewee_name: 'Maria Rodriguez',
  interviewee_age: 78,
  relationship: 'Grandmother',
  birthplace: 'Oaxaca, Mexico',
  current_location: 'Los Angeles, California',
  language: 'es',
  interview_link_code: DEMO_CODE,
  playback_link_code: DEMO_CODE,
  created_at: '2026-01-01T00:00:00Z',
  completed_at: '2026-01-01T02:00:00Z',
  questions: [
    { id: 'q1', interview_id: 'demo-interview-1', question_text: 'What is your earliest childhood memory?', priority_order: 0, is_custom: false, was_asked: true },
    { id: 'q2', interview_id: 'demo-interview-1', question_text: 'Tell me about your parents. What were they like?', priority_order: 1, is_custom: false, was_asked: true },
    { id: 'q3', interview_id: 'demo-interview-1', question_text: 'What was it like growing up in Oaxaca?', priority_order: 2, is_custom: false, was_asked: true },
    { id: 'q4', interview_id: 'demo-interview-1', question_text: 'When did you decide to come to America? What was that journey like?', priority_order: 3, is_custom: false, was_asked: true },
  ],
  responses: [
    {
      id: 'r1',
      interview_id: 'demo-interview-1',
      order_index: 0,
      question_text: 'What is your earliest childhood memory?',
      transcript: 'My earliest memory... I must have been about four years old. We lived in a small house in Oaxaca with a courtyard filled with bougainvillea. I remember my grandmother—my abuela—making chocolate on the metate, grinding the cacao beans by hand. The smell would fill the whole house. She would let me taste it, and it was bitter but so rich. She would add piloncillo to sweeten it. Those mornings with her, watching her hands work the stone, that is my first memory. The purple flowers, the smell of chocolate, and the sound of her singing old songs I still remember today.',
      transcript_segments: [
        { text: 'My earliest memory...', startTime: 0, endTime: 3 },
        { text: 'I must have been about four years old.', startTime: 3, endTime: 7 },
        { text: 'We lived in a small house in Oaxaca', startTime: 7, endTime: 11 },
        { text: 'with a courtyard filled with bougainvillea.', startTime: 11, endTime: 16 },
        { text: 'I remember my grandmother—my abuela—', startTime: 16, endTime: 21 },
        { text: 'making chocolate on the metate,', startTime: 21, endTime: 25 },
        { text: 'grinding the cacao beans by hand.', startTime: 25, endTime: 30 },
        { text: 'The smell would fill the whole house.', startTime: 30, endTime: 35 },
        { text: 'She would let me taste it,', startTime: 35, endTime: 39 },
        { text: 'and it was bitter but so rich.', startTime: 39, endTime: 44 },
        { text: 'She would add piloncillo to sweeten it.', startTime: 44, endTime: 50 },
        { text: 'Those mornings with her,', startTime: 50, endTime: 54 },
        { text: 'watching her hands work the stone,', startTime: 54, endTime: 59 },
        { text: 'that is my first memory.', startTime: 59, endTime: 64 },
        { text: 'The purple flowers,', startTime: 64, endTime: 68 },
        { text: 'the smell of chocolate,', startTime: 68, endTime: 72 },
        { text: 'and the sound of her singing old songs', startTime: 72, endTime: 78 },
        { text: 'I still remember today.', startTime: 78, endTime: 83 },
      ],
      duration_seconds: 83,
      is_ai_generated: false,
      created_at: '2026-01-01T00:10:00Z',
    },
    {
      id: 'r2',
      interview_id: 'demo-interview-1',
      order_index: 1,
      question_text: 'Tell me about your parents. What were they like?',
      transcript: 'My father, he was a carpenter. Strong hands, always smelling of wood shavings and varnish. He made furniture for the wealthy families in town. He was quiet, but when he spoke, everyone listened. He taught me that work done with love lasts forever. My mother was the opposite—always talking, always laughing. She was the heart of our home. She raised six children and still found time to help everyone in the neighborhood. When someone was sick, she was there with soup. When there was a celebration, she was cooking for days. They loved each other deeply. I never heard them argue in front of us.',
      transcript_segments: [
        { text: 'My father, he was a carpenter.', startTime: 0, endTime: 4 },
        { text: 'Strong hands,', startTime: 4, endTime: 7 },
        { text: 'always smelling of wood shavings and varnish.', startTime: 7, endTime: 12 },
        { text: 'He made furniture for the wealthy families in town.', startTime: 12, endTime: 18 },
        { text: 'He was quiet,', startTime: 18, endTime: 21 },
        { text: 'but when he spoke, everyone listened.', startTime: 21, endTime: 26 },
        { text: 'He taught me that work done with love lasts forever.', startTime: 26, endTime: 33 },
        { text: 'My mother was the opposite—', startTime: 33, endTime: 37 },
        { text: 'always talking, always laughing.', startTime: 37, endTime: 42 },
        { text: 'She was the heart of our home.', startTime: 42, endTime: 47 },
        { text: 'She raised six children', startTime: 47, endTime: 51 },
        { text: 'and still found time to help everyone in the neighborhood.', startTime: 51, endTime: 58 },
        { text: 'When someone was sick, she was there with soup.', startTime: 58, endTime: 64 },
        { text: 'When there was a celebration, she was cooking for days.', startTime: 64, endTime: 72 },
        { text: 'They loved each other deeply.', startTime: 72, endTime: 77 },
        { text: 'I never heard them argue in front of us.', startTime: 77, endTime: 83 },
      ],
      duration_seconds: 83,
      is_ai_generated: false,
      created_at: '2026-01-01T00:30:00Z',
    },
    {
      id: 'r3',
      interview_id: 'demo-interview-1',
      order_index: 2,
      question_text: 'What was it like growing up in Oaxaca?',
      transcript: 'Oaxaca was magical. The colors, the markets, the festivals. Every day the plaza would fill with vendors selling chapulines—grasshoppers—and tlayudas. I would walk to school barefoot through dusty roads, past the church where my parents married. We did not have much money, but we had community. Everyone knew everyone. The whole town celebrated together during Guelaguetza. I learned to dance, to embroider, to make the black pottery our region is famous for. Life was simple but full of beauty. The mountains around us felt like protective arms. I still dream of those mountains.',
      transcript_segments: [
        { text: 'Oaxaca was magical.', startTime: 0, endTime: 4 },
        { text: 'The colors, the markets, the festivals.', startTime: 4, endTime: 9 },
        { text: 'Every day the plaza would fill with vendors', startTime: 9, endTime: 14 },
        { text: 'selling chapulines—grasshoppers—and tlayudas.', startTime: 14, endTime: 20 },
        { text: 'I would walk to school barefoot through dusty roads,', startTime: 20, endTime: 27 },
        { text: 'past the church where my parents married.', startTime: 27, endTime: 33 },
        { text: 'We did not have much money,', startTime: 33, endTime: 37 },
        { text: 'but we had community.', startTime: 37, endTime: 41 },
        { text: 'Everyone knew everyone.', startTime: 41, endTime: 45 },
        { text: 'The whole town celebrated together during Guelaguetza.', startTime: 45, endTime: 52 },
        { text: 'I learned to dance, to embroider,', startTime: 52, endTime: 57 },
        { text: 'to make the black pottery our region is famous for.', startTime: 57, endTime: 64 },
        { text: 'Life was simple but full of beauty.', startTime: 64, endTime: 70 },
        { text: 'The mountains around us felt like protective arms.', startTime: 70, endTime: 77 },
        { text: 'I still dream of those mountains.', startTime: 77, endTime: 83 },
      ],
      duration_seconds: 83,
      is_ai_generated: false,
      created_at: '2026-01-01T01:00:00Z',
    },
    {
      id: 'r4',
      interview_id: 'demo-interview-1',
      order_index: 3,
      question_text: 'When did you decide to come to America? What was that journey like?',
      transcript: 'I was twenty-two when I met your grandfather. He had already gone to California, working in the fields. He came back to marry me, but we both knew the future was in the north. Leaving was the hardest thing. My mother cried for three days. The journey... it was dangerous. We crossed through the desert at night, my heart pounding the whole time. I was pregnant with your uncle then, though I did not know it yet. When we finally made it to Los Angeles, I did not speak English. I was scared. But your grandfather held my hand and said, "We will build something beautiful here." And we did. Every sacrifice was for the family. For you.',
      transcript_segments: [
        { text: 'I was twenty-two when I met your grandfather.', startTime: 0, endTime: 5 },
        { text: 'He had already gone to California,', startTime: 5, endTime: 9 },
        { text: 'working in the fields.', startTime: 9, endTime: 13 },
        { text: 'He came back to marry me,', startTime: 13, endTime: 17 },
        { text: 'but we both knew the future was in the north.', startTime: 17, endTime: 23 },
        { text: 'Leaving was the hardest thing.', startTime: 23, endTime: 28 },
        { text: 'My mother cried for three days.', startTime: 28, endTime: 33 },
        { text: 'The journey... it was dangerous.', startTime: 33, endTime: 39 },
        { text: 'We crossed through the desert at night,', startTime: 39, endTime: 45 },
        { text: 'my heart pounding the whole time.', startTime: 45, endTime: 50 },
        { text: 'I was pregnant with your uncle then,', startTime: 50, endTime: 55 },
        { text: 'though I did not know it yet.', startTime: 55, endTime: 60 },
        { text: 'When we finally made it to Los Angeles,', startTime: 60, endTime: 66 },
        { text: 'I did not speak English. I was scared.', startTime: 66, endTime: 72 },
        { text: 'But your grandfather held my hand and said,', startTime: 72, endTime: 78 },
        { text: '"We will build something beautiful here."', startTime: 78, endTime: 84 },
        { text: 'And we did.', startTime: 84, endTime: 87 },
        { text: 'Every sacrifice was for the family.', startTime: 87, endTime: 92 },
        { text: 'For you.', startTime: 92, endTime: 95 },
      ],
      duration_seconds: 95,
      is_ai_generated: false,
      created_at: '2026-01-01T01:30:00Z',
    },
  ],
};
interviews.set(DEMO_CODE, demoInterview);
interviews.set('demo-interview-1', demoInterview);

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Interview operations
export async function createInterview(data: {
  organizer_name?: string;
  interviewee_name: string;
  interviewee_age?: number;
  relationship: string;
  birthplace: string;
  current_location?: string;
  language: string;
  questions: string[];
}): Promise<{ id: string; interview_link_code: string; playback_link_code: string }> {
  const id = generateId();
  const interview_link_code = generateCode();
  const playback_link_code = generateCode();

  const questions: SuggestedQuestion[] = data.questions.map((q, i) => ({
    id: generateId(),
    interview_id: id,
    question_text: q,
    priority_order: i,
    is_custom: false,
    was_asked: false,
  }));

  const interview: Interview & { questions: SuggestedQuestion[]; responses: Response[] } = {
    id,
    status: 'ready',
    organizer_name: data.organizer_name || '',
    interviewee_name: data.interviewee_name,
    interviewee_age: data.interviewee_age,
    relationship: data.relationship,
    birthplace: data.birthplace,
    current_location: data.current_location,
    language: data.language,
    interview_link_code,
    playback_link_code,
    created_at: new Date().toISOString(),
    questions,
    responses: [],
  };

  // Store by both codes for easy lookup
  interviews.set(interview_link_code, interview);
  interviews.set(playback_link_code, interview);
  interviews.set(id, interview);

  return { id, interview_link_code, playback_link_code };
}

export async function getInterviewByCode(code: string): Promise<(Interview & { questions: SuggestedQuestion[]; responses: Response[] }) | null> {
  return interviews.get(code) || null;
}

export async function getInterviewById(id: string): Promise<(Interview & { questions: SuggestedQuestion[]; responses: Response[] }) | null> {
  return interviews.get(id) || null;
}

export async function updateInterviewStatus(id: string, status: Interview['status']): Promise<void> {
  const interview = interviews.get(id);
  if (interview) {
    interview.status = status;
    if (status === 'completed') {
      interview.completed_at = new Date().toISOString();
    }
  }
}

export async function addResponse(interviewId: string, data: {
  question_text: string;
  transcript: string;
  video_url?: string;
  duration_seconds?: number;
  is_ai_generated: boolean;
  segments?: { text: string; startTime: number; endTime: number }[];
}): Promise<Response> {
  const interview = interviews.get(interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }

  const response: Response = {
    id: generateId(),
    interview_id: interviewId,
    order_index: interview.responses.length,
    question_text: data.question_text,
    transcript: data.transcript,
    video_url: data.video_url,
    duration_seconds: data.duration_seconds,
    is_ai_generated: data.is_ai_generated,
    transcript_segments: data.segments,
    created_at: new Date().toISOString(),
  };

  interview.responses.push(response);
  return response;
}

// Alias for consistency
export async function getInterview(id: string): Promise<(Interview & { questions: SuggestedQuestion[]; responses: Response[] }) | null> {
  return getInterviewById(id);
}

export async function getResponses(interviewId: string): Promise<Response[]> {
  const interview = interviews.get(interviewId);
  return interview?.responses || [];
}

// For debugging
export function getAllInterviews(): Map<string, Interview & { questions: SuggestedQuestion[]; responses: Response[] }> {
  return interviews;
}

