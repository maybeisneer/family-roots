import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getStarterQuestions } from '@/lib/questions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Life phases for interview structure
const LIFE_PHASES = [
  'ORIGINS',      // Parents, birthplace, earliest memories
  'CHILDHOOD',    // Growing up, school, friends, family life
  'YOUTH',        // Teenage years, education, first interests
  'LOVE',         // Meeting partner, courtship, marriage
  'FAMILY',       // Having children, raising family
  'JOURNEY',      // Migration, career, major life changes
  'LEGACY',       // Wisdom, advice, messages for future generations
];

// Anchor questions that ALWAYS appear (one per key phase)
const ANCHOR_QUESTIONS = {
  ORIGINS: "What is your earliest memory?",
  LOVE: "Tell me about the day you met {partner}.",
  LEGACY: "What lessons do you want to pass on to future generations of our family?",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, relationship, birthplace, current_location, language, context } = body;

    // Determine partner reference based on relationship
    const partnerRef = (relationship === 'mother' || relationship === 'grandmother') ? 'Dad' : 
                       (relationship === 'father' || relationship === 'grandfather') ? 'Mum' : 'your partner';

    // Check if they migrated
    const hasMigrated = current_location && birthplace && 
      !current_location.toLowerCase().includes(birthplace.toLowerCase()) && 
      !birthplace.toLowerCase().includes(current_location.toLowerCase());

    // Try AI-generated questions
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Create interview questions for ${name} from ${birthplace}${hasMigrated ? `, now living in ${current_location}` : ''}.

CONTEXT FROM ORGANIZER:
"${context}"

STRUCTURE BY LIFE PHASES (generate 1-2 questions per phase):

1. **ORIGINS** (1-2 questions) - Their parents, grandparents, earliest memories
2. **CHILDHOOD** (2-3 questions) - Growing up, school, friends, family traditions  
3. **YOUTH** (2-3 questions) - Teenage years, education, early interests
4. **LOVE** (1-2 questions) - Courtship, wedding day
5. **FAMILY** (1-2 questions) - Becoming a parent, raising children
6. **JOURNEY** (1-2 questions)${hasMigrated ? ` - Moving from ${birthplace} to ${current_location}` : ` - Career, major life changes`}
7. **LEGACY** (1-2 questions) - Life lessons, wisdom, hopes

CRITICAL RULES:
- Questions are FROM THE INTERVIEWEE'S PERSPECTIVE ONLY
- Keep it simple: "Tell me about your mother" NOT "Tell me about your mother, my grandmother"
- ONE topic per question (no "and")
- Under 15 words
- Use: "Tell me about...", "What do you remember...", "What was it like..."

DO NOT include these (I'll add them):
- "${ANCHOR_QUESTIONS.ORIGINS}"
- "Tell me about the day you met ${partnerRef}."
- "${ANCHOR_QUESTIONS.LEGACY}"

Return ONLY a JSON array of 8-10 question STRINGS.
Example: ["Tell me about your mother.", "What was school like for you?"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Parse the JSON array from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Handle both string arrays and object arrays {phase, question}
          const aiQuestions: string[] = parsed.map((item: string | { question?: string; text?: string; phase?: string }) => {
            if (typeof item === 'string') return item;
            // If it's an object, extract the question text
            return item.question || item.text || String(item);
          });
          
          // Build final question list with anchors in the right spots
          let questions: string[] = [];
          
          // 1. ORIGINS - Start with anchor
          questions.push(ANCHOR_QUESTIONS.ORIGINS);
          
          // 2. Add AI questions for CHILDHOOD, YOUTH (roughly first 4-5)
          const childhoodYouthQuestions = aiQuestions.slice(0, 5);
          questions.push(...childhoodYouthQuestions);
          
          // 3. LOVE - Add anchor about meeting partner
          questions.push(`Tell me about the day you met ${partnerRef}.`);
          
          // 4. Add AI questions for FAMILY, JOURNEY (next 3-4)
          const familyJourneyQuestions = aiQuestions.slice(5, 9);
          questions.push(...familyJourneyQuestions);
          
          // 5. LEGACY - End with wisdom anchor
          questions.push(ANCHOR_QUESTIONS.LEGACY);
          
          // Add any remaining AI questions before the final anchor
          if (aiQuestions.length > 9) {
            const remaining = aiQuestions.slice(9);
            // Insert before the last question
            questions.splice(questions.length - 1, 0, ...remaining);
          }
          
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
        // If we fail, return the error in the response headers so the client knows
        let questions = getStarterQuestions(relationship, birthplace, current_location);
        // Add a fake error question so we can see it in the UI
        questions.unshift(`DEBUG ERROR: ${error.message || 'Unknown AI Error'}`);
        return NextResponse.json({ questions });
      }
    }

    // Fallback to starter questions
    let questions = getStarterQuestions(relationship, birthplace, current_location);
    
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
