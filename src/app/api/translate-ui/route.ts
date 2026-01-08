import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese (Simplified)',
  hi: 'Hindi',
  ar: 'Arabic',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  vi: 'Vietnamese',
  tl: 'Tagalog',
};

interface StringToTranslate {
  key: string;
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    const { strings, targetLanguage } = await request.json();

    if (!strings || !targetLanguage || !Array.isArray(strings)) {
      return NextResponse.json(
        { error: 'Missing required fields: strings (array), targetLanguage' },
        { status: 400 }
      );
    }

    // If target is English, return original strings
    if (targetLanguage === 'en') {
      const translations: Record<string, string> = {};
      strings.forEach((s: StringToTranslate) => {
        translations[s.key] = s.value;
      });
      return NextResponse.json({ translations });
    }

    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });

    // Create a structured prompt with all strings
    const stringsFormatted = strings
      .map((s: StringToTranslate) => `${s.key}: "${s.value}"`)
      .join('\n');

    const prompt = `You are translating UI text for a family interview recording application to ${languageName}.

These strings will be used in buttons, labels, and instructions during a video recording session where someone is sharing their life story.

IMPORTANT:
- Maintain a warm, respectful, and encouraging tone
- Keep translations concise (UI space is limited)
- Preserve any placeholder syntax like {count}
- Be culturally appropriate for family contexts

Translate the following UI strings to ${languageName}:

${stringsFormatted}

Respond with ONLY a JSON object mapping the keys to translated values. Example format:
{
  "takeYourTime": "translated text here",
  "pause": "translated text here"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const translations = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ translations });
    }

    throw new Error('Could not parse translation response');
  } catch (error) {
    console.error('UI translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate UI strings' },
      { status: 500 }
    );
  }
}

