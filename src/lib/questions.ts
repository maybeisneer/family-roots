import type { LanguageOption, Relationship } from '@/types';

// Supported languages for the interview
export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '普通话' },
  { code: 'yue', name: 'Cantonese', nativeName: '廣東話' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tl', name: 'Filipino/Tagalog', nativeName: 'Tagalog' },
];

// Relationship options
export const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'grandmother', label: 'Grandmother' },
  { value: 'grandfather', label: 'Grandfather' },
  { value: 'aunt', label: 'Aunt' },
  { value: 'uncle', label: 'Uncle' },
  { value: 'other', label: 'Other' },
];

// Core question themes for family history preservation
export const QUESTION_THEMES = {
  earlyLife: [
    "What's your earliest memory? Take me back to that moment.",
    "What was your childhood home like? Can you describe it to me?",
    "What was the neighborhood or village like where you grew up?",
    "What sounds, smells, or feelings do you remember from childhood?",
  ],
  family: [
    "Tell me about your parents. What do you remember most about them?",
    "What did your mother do? What was she like?",
    "What did your father do? What was he like?",
    "Did you have siblings? What was your relationship like with them?",
    "Who else lived in your household when you were growing up?",
    "What values did your parents teach you?",
  ],
  dailyLife: [
    "What was a typical day like when you were young?",
    "What did your family eat? Are there dishes you still remember?",
    "What games did you play as a child? Who did you play with?",
    "What was school like for you?",
    "Did you have chores or responsibilities as a child?",
  ],
  culture: [
    "What holidays or traditions were important to your family?",
    "What traditions from your childhood do you still carry with you?",
    "Were there any special celebrations or ceremonies you remember?",
    "What role did religion or spirituality play in your family?",
  ],
  pivotalMoments: [
    "When did you first leave home? What was that like?",
    "How did you meet your spouse?",
    "What was the hardest decision you ever had to make?",
    "What moment changed the direction of your life?",
    "What was the happiest day of your life?",
    "What challenges did you overcome that made you who you are?",
  ],
  wisdom: [
    "What do you wish you had known when you were younger?",
    "What are you most proud of in your life?",
    "What do you want your grandchildren to know about where they come from?",
    "If you could give one piece of advice to the next generation, what would it be?",
    "What traditions or values do you hope will continue in our family?",
  ],
};

// Get starter questions based on relationship and birthplace
export function getStarterQuestions(relationship: string, birthplace: string, currentLocation?: string): string[] {
  const questions = [
    "What's your earliest memory? Take me back to that moment.",
    `Tell me about growing up in ${birthplace}. What was it like back then?`,
    "Tell me about your parents. What do you remember most about them?",
  ];

  // Add migration question if locations differ significantly
  if (currentLocation && birthplace && 
      !currentLocation.toLowerCase().includes(birthplace.toLowerCase()) && 
      !birthplace.toLowerCase().includes(currentLocation.toLowerCase())) {
    questions.push(`How did you feel when you first arrived in ${currentLocation}? What was the biggest change?`);
  }

  questions.push("What was a typical day like when you were young?");

  // Add relationship-specific questions
  if (relationship === 'mother') {
    questions.push("How did you meet my father? Tell me that story.");
    questions.push("What was it like when you first held me?");
  } else if (relationship === 'father') {
    questions.push("How did you meet my mother? Tell me that story.");
    questions.push("What was going through your mind when you became a father?");
  } else if (relationship === 'grandmother') {
    questions.push("How did you meet my grandfather?");
    questions.push("What was my parent like as a child?");
  } else if (relationship === 'grandfather') {
    questions.push("How did you meet my grandmother?");
    questions.push("What was my parent like as a child?");
  } else if (['aunt', 'uncle'].includes(relationship)) {
    questions.push("What are your favorite memories with my parent growing up?");
  }

  questions.push(
    "What traditions or customs were important in your family?",
    "What challenges did you overcome that made you who you are today?",
    "What are you most proud of in your life?",
    "What wisdom or advice do you want to pass down to the future generations of our family?"
  );

  return questions;
}

// Generate a unique link code
export function generateLinkCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

