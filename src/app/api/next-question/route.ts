import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PreviousResponse {
  question: string;
  transcript: string;
}

// Core topics we want to cover for a complete life story
const CORE_TOPICS = [
  'earliest_memories',      // Childhood, first memories
  'parents_family',         // Parents, siblings, family dynamics
  'homeland_upbringing',    // Where they grew up, what it was like
  'education_youth',        // School, friends, coming of age
  'major_transitions',      // Immigration, career changes, moving
  'love_family',            // Meeting spouse, starting family
  'challenges',             // Hardships overcome
  'proudest_moments',       // Achievements, proud memories
  'wisdom_legacy',          // Advice, what they want remembered
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      interviewee_name,
      interviewee_age,
      birthplace,
      relationship,
      previous_responses,
      current_transcript,
      language,
    } = body;

    const responses = (previous_responses as PreviousResponse[]) || [];
    const responseCount = responses.length;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback without AI
      return NextResponse.json({
        question: "That's really interesting. Can you tell me more about that?",
        phase: 'exploring',
        shouldWrapUp: false,
        topicsCovered: [],
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Build conversation history
    const conversationHistory = responses
      .map((r, i) => `Q${i + 1}: "${r.question}"\nA${i + 1}: "${r.transcript || '[No response]'}"`)
      .join('\n\n');

    // Build list of previously asked questions for duplicate prevention
    const previousQuestions = responses.map(r => r.question).filter(Boolean);

    // First, analyze what topics have been covered
    const analysisPrompt = `Analyze this interview and determine which life story topics have been meaningfully covered.

Interview with ${interviewee_name}${interviewee_age ? ` (${interviewee_age} years old)` : ''}, from ${birthplace}:

${conversationHistory}

Latest response: "${current_transcript}"

Topics to check (respond with JSON):
- earliest_memories: Childhood, first memories
- parents_family: Parents, siblings, family dynamics  
- homeland_upbringing: Where they grew up, daily life
- education_youth: School, friends, formative years
- major_transitions: Immigration, big life changes, career
- love_family: Spouse, marriage, children
- challenges: Hardships, difficulties overcome
- proudest_moments: Achievements, proud memories
- wisdom_legacy: Life advice, values, what they want remembered

Respond ONLY with a JSON object like:
{
  "covered": ["earliest_memories", "parents_family"],
  "partially_covered": ["homeland_upbringing"],
  "natural_next_topic": "major_transitions",
  "interesting_thread": "they mentioned their grandmother's chocolate - could explore more",
  "feels_complete": false,
  "reason": "Haven't discussed their journey to America or their own family yet"
}`;

    let analysis = {
      covered: [] as string[],
      partially_covered: [] as string[],
      natural_next_topic: 'exploring',
      interesting_thread: '',
      feels_complete: false,
      reason: '',
    };

    try {
      const analysisResult = await model.generateContent(analysisPrompt);
      const analysisText = analysisResult.response.text().trim();
      // Extract JSON from response (might be wrapped in markdown code block)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Could not parse analysis:', e);
    }

    // Determine interview phase
    const totalCovered = analysis.covered.length + (analysis.partially_covered.length * 0.5);
    const coverageRatio = totalCovered / CORE_TOPICS.length;
    
    let phase: 'exploring' | 'deepening' | 'wrapping_up' | 'final' = 'exploring';
    
    if (analysis.feels_complete || coverageRatio >= 0.7) {
      // Good coverage - start wrapping up
      phase = responseCount >= 10 ? 'final' : 'wrapping_up';
    } else if (responseCount >= 6) {
      // Been going a while - start deepening specific topics
      phase = 'deepening';
    }

    // Generate the next question based on phase
    let questionPrompt = '';

    // Build questions already asked section for all prompts (duplicate prevention)
    const questionsAlreadyAsked = previousQuestions.length > 0
      ? `\n\nQUESTIONS ALREADY ASKED (DO NOT REPEAT OR REPHRASE THESE):\n${previousQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}`
      : '';

    if (phase === 'final') {
      questionPrompt = `Generate a FINAL question to end this life story interview.

Topics covered: ${analysis.covered.join(', ')}${questionsAlreadyAsked}

RULES:
- NO name prefix (Don't start with "Mom," or a name)
- This is the CLOSING question
- Under 15 words
- Legacy/wisdom theme
- Do NOT repeat or rephrase any question from the list above

Good examples:
- "What do you hope future generations remember about you?"
- "Is there anything else you'd like your family to know?"
- "What lesson do you most want to pass on?"

Respond with ONLY the question.`;

    } else if (phase === 'wrapping_up') {
      questionPrompt = `Generate a wrap-up question for this life story interview.

Topics covered: ${analysis.covered.join(', ')}
${analysis.interesting_thread ? `Could explore: ${analysis.interesting_thread}` : ''}${questionsAlreadyAsked}

RULES:
- NO name prefix (Don't start with "Mom," or a name)
- Under 20 words
- Either wisdom/legacy theme OR one final story
- Do NOT repeat or rephrase any question from the list above

Good: "What advice would you give to young people today?"
Good: "What are you most proud of in your life?"
Bad: "Mom, as we wrap up, what would you like to share..."

Respond with ONLY the question.`;

    } else {
      // Exploring or deepening
      questionPrompt = `Generate a follow-up interview question for ${interviewee_name} (from ${birthplace}).

What they just shared: "${current_transcript}"

Topics covered: ${analysis.covered.join(', ') || 'None yet'}
Topics to explore: ${CORE_TOPICS.filter(t => !analysis.covered.includes(t)).join(', ')}
${analysis.interesting_thread ? `Follow up on: ${analysis.interesting_thread}` : ''}${questionsAlreadyAsked}

RULES:
- NO NAME PREFIX (Don't start with "Mom," or "${interviewee_name},")
- Keep under 20 words
- ONE topic only (no "and")
- Simple phrasing: "Tell me about...", "What was it like...", "What do you remember..."
- From THEIR perspective only
- CRITICAL: Move to a NEW topic from the "Topics to explore" list. Do NOT ask about topics already covered.
- CRITICAL: Do NOT repeat or rephrase any question from the "QUESTIONS ALREADY ASKED" list. Each question must be unique.

Good: "Tell me about your wedding day."
Good: "What was it like moving to a new country?"
Bad: "Mom, I'd love to hear about your wedding day and how you felt."
Bad: "${interviewee_name}, can you share about..."
Bad: Asking about "childhood memories" again when already asked.

Respond with ONLY the question.`;
    }

    const result = await model.generateContent(questionPrompt);
    let question = result.response.text().trim().replace(/^["']|["']$/g, '');

    // Translate question if language is not English
    if (language && language !== 'en') {
      try {
        console.log(`Translating question to ${language}...`);
        const translateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: question, targetLanguage: language }),
        });
        if (translateResponse.ok) {
          const { translatedText } = await translateResponse.json();
          question = translatedText;
        }
      } catch (err) {
        console.error('Translation error for next question:', err);
      }
    }

    return NextResponse.json({
      question,
      phase,
      shouldWrapUp: phase === 'wrapping_up' || phase === 'final',
      isLastQuestion: phase === 'final',
      topicsCovered: analysis.covered,
      coverageRatio: Math.round(coverageRatio * 100),
    });

  } catch (error) {
    console.error('Error generating next question:', error);
    return NextResponse.json({
      question: "That's a wonderful memory. Is there anything else about that time you'd like to share?",
      phase: 'exploring',
      shouldWrapUp: false,
      isLastQuestion: false,
    });
  }
}
