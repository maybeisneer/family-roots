import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getStarterQuestions } from '@/lib/questions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, relationship, birthplace, current_location, language, context } = body;

    // Check if they migrated
    const hasMigrated = current_location && birthplace &&
      !current_location.toLowerCase().includes(birthplace.toLowerCase()) &&
      !birthplace.toLowerCase().includes(current_location.toLowerCase());

    // Try AI-generated questions
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Generate 5 interview starter questions for ${name}, a ${relationship} from ${birthplace}${hasMigrated ? ` who now lives in ${current_location}` : ''}.

${context ? `IMPORTANT CONTEXT FROM FAMILY:\n"${context}"\n` : ''}
GOAL: Create questions that are EASY to answer and invite storytelling. These are starting points - the AI will generate follow-ups during the interview based on their responses.

LIFE ARCS TO COVER (one question each):
1. EARLY LIFE - Childhood, growing up, family
2. FORMATIVE YEARS - School, interests, what shaped them
3. LOVE & RELATIONSHIPS - Meeting partner, important relationships
4. LIFE JOURNEY - ${hasMigrated ? `Moving from ${birthplace} to ${current_location}, ` : ''}career, major changes
5. REFLECTION - What they've learned, what matters most

QUESTION STYLE:
- Open-ended but EASY to start answering
- Short and simple (under 12 words)
- Conversational, not formal
- Questions must be SELF-CONTAINED - don't reference the person asking or assume the interviewee knows who set this up
- If context mentions specific things (hobbies, career, events), reference them!

GOOD EXAMPLES:
- "What was your childhood home like?"
- "What got you into cooking?"
- "Who has been the most important person in your life?"
- "What was the biggest risk you ever took?"
- "What do you wish you'd known at 20?"

BAD EXAMPLES (too vague or hard):
- "Tell me about your earliest memory" (too hard to recall)
- "What lessons do you want to pass on to future generations?" (too formal/heavy)
- "Describe your childhood" (too broad)
- "How did you two meet?" (confusing - who is "you two"?)
- "How did you and Dad meet?" (assumes interviewee knows who's asking)
- "How did you meet your spouse?" (assumes they have a spouse)

Return ONLY a JSON array of exactly 5 question strings.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse the JSON array from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          // Handle both string arrays and object arrays
          let questions: string[] = parsed.map((item: string | { question?: string; text?: string }) => {
            if (typeof item === 'string') return item;
            return item.question || item.text || String(item);
          });

          // Ensure we have exactly 5 questions
          questions = questions.slice(0, 5);

          // Translate questions if language is not English
          if (language && language !== 'en') {
            console.log(`Translating ${questions.length} questions to ${language}...`);
            const translationPromises = questions.map(async (q: string) => {
              try {
                const translateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/translate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: q, targetLanguage: language }),
                });
                if (translateResponse.ok) {
                  const { translatedText } = await translateResponse.json();
                  return translatedText;
                }
                return q;
              } catch (err) {
                console.error('Translation error for question:', err);
                return q;
              }
            });
            questions = await Promise.all(translationPromises);
          }

          return NextResponse.json({ questions });
        }
      } catch (error: any) {
        console.error('Gemini API error:', error);
      }
    }

    // Fallback to simple starter questions
    let questions = getStarterQuestions(relationship, birthplace, current_location).slice(0, 5);

    // Translate fallback questions if language is not English
    if (language && language !== 'en') {
      try {
        const translationPromises = questions.map(async (q: string) => {
          try {
            const translateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: q, targetLanguage: language }),
            });
            if (translateResponse.ok) {
              const { translatedText } = await translateResponse.json();
              return translatedText;
            }
            return q;
          } catch (err) {
            return q;
          }
        });
        questions = await Promise.all(translationPromises);
      } catch (err) {
        console.error('Error translating fallback questions:', err);
      }
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
