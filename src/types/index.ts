// Interview status
export type InterviewStatus = 'draft' | 'ready' | 'in_progress' | 'completed';

// Main interview data
export interface Interview {
  id: string;
  status: InterviewStatus;
  organizer_id?: string;    // Auth ID of the person who created it
  organizer_name: string;  // Person setting up the interview
  interviewee_name: string;
  interviewee_age?: number;
  relationship: string;
  birthplace: string;
  current_location?: string;
  language: string;
  interview_link_code: string;
  playback_link_code: string;
  created_at: string;
  completed_at?: string;
}

// Suggested questions for the interview
export interface SuggestedQuestion {
  id: string;
  interview_id: string;
  question_text: string;
  priority_order: number;
  is_custom: boolean;
  was_asked: boolean;
}

// Transcript segment with timing info for sync
export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}

// Stored translations for a transcript
export interface TranscriptTranslations {
  [languageCode: string]: string;  // e.g., { "es": "Hola...", "zh": "你好..." }
}

// Individual response/recording
export interface Response {
  id: string;
  interview_id: string;
  order_index: number;
  question_text: string;
  video_url?: string;
  transcript?: string;
  transcript_segments?: TranscriptSegment[];
  translations?: TranscriptTranslations;  // Pre-computed translations
  duration_seconds?: number;
  is_ai_generated: boolean;
  created_at: string;
}

// Setup wizard state
export interface SetupState {
  organizer_name: string;  // Person setting up the interview
  interviewee_name: string;
  interviewee_age?: number;
  relationship: string;
  birthplace: string;
  current_location: string;
  language: string;
  context?: string;  // Additional context/tidbits about the person
  suggested_questions: SuggestedQuestion[];
}

// Recording state
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  currentQuestionIndex: number;
  questions: SuggestedQuestion[];
  responses: Response[];
}

// Language options
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

// Relationship options
export type Relationship = 
  | 'mother'
  | 'father'
  | 'grandmother'
  | 'grandfather'
  | 'aunt'
  | 'uncle'
  | 'other';

