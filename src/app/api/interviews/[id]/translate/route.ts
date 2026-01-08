import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getInterviewById, getResponsesByInterviewId, updateResponse } from '@/lib/firebase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Languages to pre-translate (excluding English as it's the source)
const TARGET_LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'tl', name: 'Tagalog' },
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params;

    // Verify interview exists
    const interview = await getInterviewById(interviewId);
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Get all responses
    const responses = await getResponsesByInterviewId(interviewId);
    if (!responses || responses.length === 0) {
      // No responses yet - return success (nothing to translate)
      return NextResponse.json({ 
        success: true, 
        interviewId, 
        translatedResponses: 0,
        message: 'No responses to translate yet' 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Track progress
    const translationResults: { responseId: string; languages: string[] }[] = [];

    // Translate each response
    for (const response of responses) {
      if (!response.transcript || response.transcript.length < 10) {
        continue; // Skip empty or very short transcripts
      }

      // Skip if translations already exist
      if (response.translations && Object.keys(response.translations).length >= TARGET_LANGUAGES.length) {
        translationResults.push({ responseId: response.id, languages: ['already_translated'] });
        continue;
      }

      const translations: Record<string, string> = response.translations || {};

      // Batch translate to all languages in one API call for efficiency
      const languagesToTranslate = TARGET_LANGUAGES.filter(l => !translations[l.code]);
      
      if (languagesToTranslate.length === 0) {
        continue;
      }

      try {
        const prompt = `Translate this family interview transcript into ${languagesToTranslate.length} languages.
Maintain the emotional tone, personal nature, and storytelling quality.

Original transcript:
"${response.transcript}"

Return ONLY a JSON object with language codes as keys and translations as values:
{
${languagesToTranslate.map(l => `  "${l.code}": "[${l.name} translation]"`).join(',\n')}
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Merge new translations
          for (const lang of languagesToTranslate) {
            if (parsed[lang.code]) {
              translations[lang.code] = parsed[lang.code];
            }
          }
        }

        // Update response with translations
        await updateResponse(response.id, { translations });

        translationResults.push({
          responseId: response.id,
          languages: Object.keys(translations),
        });

      } catch (err) {
        console.error(`Error translating response ${response.id}:`, err);
        // Continue with other responses even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      interviewId,
      translatedResponses: translationResults.length,
      details: translationResults,
    });

  } catch (error) {
    console.error('Error in translate endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to translate interview', details: String(error) },
      { status: 500 }
    );
  }
}

