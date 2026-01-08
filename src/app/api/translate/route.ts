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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts, targetLanguage } = body;

    // Support both single text and batch texts
    const isBatch = Array.isArray(texts);
    const inputTexts = isBatch ? texts : [text];

    if ((!text && !texts) || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text (or texts array), targetLanguage' },
        { status: 400 }
      );
    }

    // If target is English, return original text(s)
    if (targetLanguage === 'en') {
      return isBatch 
        ? NextResponse.json({ translatedTexts: inputTexts })
        : NextResponse.json({ translatedText: text });
    }

    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    if (isBatch && inputTexts.length > 1) {
      // Batch translation - translate all at once for efficiency
      const numberedTexts = inputTexts.map((t: string, i: number) => `[${i}] ${t}`).join('\n');
      
      const prompt = `Translate each numbered line to ${languageName}.
Maintain the emotional tone and personal nature of the speech.
This is from a family interview, so preserve the intimate, storytelling quality.
Return ONLY a JSON array of translated strings in the same order.

Lines to translate:
${numberedTexts}

Return format: ["translated line 0", "translated line 1", ...]`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Parse JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const translatedTexts = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ translatedTexts });
      }
      
      // Fallback: return original if parsing fails
      return NextResponse.json({ translatedTexts: inputTexts });
    } else {
      // Single text translation
      const singleText = isBatch ? inputTexts[0] : text;
      
      const prompt = `Translate the following text to ${languageName}. 
Maintain the emotional tone and personal nature of the speech.
This is from a family interview, so preserve the intimate, storytelling quality.
Only respond with the translated text, nothing else.

Text to translate:
"${singleText}"`;

      const result = await model.generateContent(prompt);
      const translatedText = result.response.text().trim().replace(/^["']|["']$/g, '');

      return isBatch
        ? NextResponse.json({ translatedTexts: [translatedText] })
        : NextResponse.json({ translatedText });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}

