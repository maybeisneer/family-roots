import type { SetupState, SuggestedQuestion } from '@/types';

const STORAGE_KEY = 'family-roots-setup';

const defaultState: SetupState = {
  organizer_name: '',
  interviewee_name: '',
  interviewee_age: undefined,
  relationship: '',
  birthplace: '',
  current_location: '',
  language: 'en',
  context: '',
  suggested_questions: [],
};

export function getSetupState(): SetupState {
  if (typeof window === 'undefined') return defaultState;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultState, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading setup state:', e);
  }
  
  return defaultState;
}

export function setSetupState(state: Partial<SetupState>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getSetupState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving setup state:', e);
  }
}

export function clearSetupState(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing setup state:', e);
  }
}

export function updateQuestions(questions: SuggestedQuestion[]): void {
  setSetupState({ suggested_questions: questions });
}

