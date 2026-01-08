import { NextRequest, NextResponse } from 'next/server';
import { addResponse, getResponses } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      interview_id,
      question_text,
      transcript,
      video_url,
      duration_seconds,
      is_ai_generated,
    } = body;

    if (!interview_id || !question_text) {
      return NextResponse.json(
        { error: 'interview_id and question_text are required' },
        { status: 400 }
      );
    }

    const response = await addResponse(interview_id, {
      question_text,
      transcript: transcript || '',
      video_url,
      duration_seconds,
      is_ai_generated: is_ai_generated || false,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const interviewId = searchParams.get('interview_id');

  if (!interviewId) {
    return NextResponse.json(
      { error: 'interview_id is required' },
      { status: 400 }
    );
  }

  const responses = await getResponses(interviewId);
  return NextResponse.json(responses);
}

