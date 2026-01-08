// Pre-generated UI translations for the recording experience

export interface RecordingUIStrings {
  // Instructions
  takeYourTime: string;
  cameraAccessNeeded: string;
  progressSaved: string;
  
  // Button labels
  pause: string;
  resume: string;
  done: string;
  takeBreak: string;
  finish: string;
  startRecording: string;
  continueNow: string;
  
  // Status
  recording: string;
  paused: string;
  
  // Question labels
  questionPrefix: string; // "Question"
  
  // Camera setup
  positionYourself: string;
  
  // Tips
  centerFace: string;
  checkLighting: string;
  checkBackground: string;
  findQuietSpace: string;
  tipsTitle: string;
  
  // Progress
  storiesShared: string; // "{count} stories" / "{count} story"
  
  // Processing states
  savingResponse: string;
  uploadingProgress: string; // "Uploading... {progress}%"
  listeningToYou: string;
  preparingNextQuestion: string;
  thankYouSharing: string;
}

// Import pre-generated translations
import en from './locales/en.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import yue from './locales/yue.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import it from './locales/it.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import id from './locales/id.json';
import tr from './locales/tr.json';
import nl from './locales/nl.json';
import uk from './locales/uk.json';
import tl from './locales/tl.json';

const translations: Record<string, RecordingUIStrings> = {
  en,
  hi,
  es,
  zh,
  yue,
  ar,
  pt,
  ru,
  fr,
  de,
  ja,
  ko,
  it,
  vi,
  th,
  id,
  tr,
  nl,
  uk,
  tl,
};

export function getRecordingUIStrings(language: string): RecordingUIStrings {
  return translations[language] || translations['en'];
}

// Helper to format the "stories shared" string
export function formatStoriesCount(count: number, template: string): string {
  const word = count === 1 ? 'story' : 'stories';
  return template.replace('{count}', `${count} ${word}`);
}

