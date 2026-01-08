import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Interview, Response } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateSuggestedQuestions(
  name: string,
  relationship: string,
  birthplace: string,
  language: string
): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are helping create an interview to capture someone's life story and family history.

Interview subject:
- Name: ${name}
- Relationship to interviewer: ${relationship}
- Born in: ${birthplace}
- Language: ${language}

Generate 8-10 thoughtful, open-ended questions that will help capture their life story, focusing on:
1. Their earliest memories and childhood
2. Their parents and what they remember about them
3. What life was like growing up in ${birthplace}
4. Family traditions and cultural heritage
5. Pivotal moments in their life
6. Wisdom they want to pass down

The questions should:
- Be warm and conversational, not interrogative
- Encourage storytelling rather than short answers
- Be culturally sensitive and appropriate
- Help preserve stories that might otherwise be lost

Return ONLY a JSON array of question strings, no other text. Example format:
["Question 1?", "Question 2?", "Question 3?"]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to default questions if parsing fails
    return getDefaultQuestions(birthplace);
  } catch (error) {
    console.error('Error generating questions:', error);
    return getDefaultQuestions(birthplace);
  }
}

export async function generateFollowUpQuestion(
  interview: Interview,
  responses: Response[],
  currentTranscript: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Build conversation history
  const conversationHistory = responses.map((r, i) => 
    `Q${i + 1}: "${r.question_text}"\nA${i + 1}: "${r.transcript || '[No transcript]'}"`
  ).join('\n\n');

  const prompt = `You are an empathetic interviewer capturing someone's life story for their family.

Interview context:
- Interviewee: ${interview.interviewee_name}${interview.interviewee_age ? `, ${interview.interviewee_age} years old` : ''}
- Born in: ${interview.birthplace}
- Relationship: ${interview.relationship}

Previous questions and responses:
${conversationHistory}

Most recent response transcript:
"${currentTranscript}"

Based on their most recent response, generate the NEXT question that:
1. Naturally follows from something specific they mentioned
2. Digs deeper into an interesting detail, name, place, or event they brought up
3. Helps preserve stories and memories that would otherwise be lost
4. Feels conversational and warm, not like an interrogation
5. Encourages them to share more about their family history

If they mentioned:
- A person → ask more about that person
- A place → ask what it was like there
- An event → ask for more details about what happened
- A time period → ask what daily life was like then

Respond with ONLY the next question, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    // Return a thoughtful generic follow-up
    return "That's really interesting. Can you tell me more about that?";
  }
}

function getDefaultQuestions(birthplace: string): string[] {
  return [
    "What's your earliest memory? Take me back to that moment.",
    `Tell me about growing up in ${birthplace}. What was it like back then?`,
    "Tell me about your parents. What do you remember most about them?",
    "What was a typical day like when you were young?",
    "What traditions or customs were important in your family?",
    "What games did you play as a child? Who did you play with?",
    "What food from your childhood do you still think about?",
    "When did you first leave home? What was that experience like?",
    "What's the most important lesson your parents taught you?",
    "What do you want your grandchildren to know about where they come from?"
  ];
}

