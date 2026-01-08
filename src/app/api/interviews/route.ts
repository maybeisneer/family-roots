import { NextRequest, NextResponse } from 'next/server';

// For development without Firebase credentials
const USE_FIREBASE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

export async function POST(request: NextRequest) {
  console.log('POST /api/interviews - USE_FIREBASE:', USE_FIREBASE);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  
  try {
    const body = await request.json();
    console.log('Request body received:', { ...body, questions: body.questions?.length || 0 });
    
    const {
      organizer_id,
      organizer_name,
      interviewee_name,
      interviewee_age,
      relationship,
      birthplace,
      current_location,
      language,
      questions,
    } = body;

    let result;
    if (USE_FIREBASE) {
      console.log('Attempting Firebase createInterview...');
      
      // Add a timeout race
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase operation timed out after 8s')), 8000)
      );

      const { createInterview } = await import('@/lib/firebase');
      
      try {
        result = await Promise.race([
          createInterview({
            organizer_id,
            organizer_name,
            interviewee_name,
            interviewee_age,
            relationship,
            birthplace,
            current_location,
            language,
            questions: questions || [],
          }),
          timeoutPromise
        ]) as any;
        console.log('Firebase createInterview succeeded:', result?.id);
      } catch (fbError: any) {
        console.error('Firebase operation failed:', fbError);
        throw new Error(`Firebase Error: ${fbError.message}`);
      }
    } else {
      console.log('Using in-memory DB fallback...');
      // Fallback to in-memory DB for local dev without credentials
      const { createInterview: createInterviewMock } = await import('@/lib/db');
      result = await createInterviewMock({
        organizer_name,
        interviewee_name,
        interviewee_age,
        relationship,
        birthplace,
        current_location,
        language,
        questions: questions || [],
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating interview:', error?.message || error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: `Failed to create interview: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Code is required' },
      { status: 400 }
    );
  }

  try {
    let interview;
    if (USE_FIREBASE) {
      const { getInterviewByCode } = await import('@/lib/firebase');
      interview = await getInterviewByCode(code);
    } else {
      // Fallback
      const { getInterviewByCode: getMock } = await import('@/lib/db');
      interview = await getMock(code);
    }

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(interview);
  } catch (error: any) {
    console.error('Error fetching interview:', error?.message || error);
    return NextResponse.json(
      { error: `Failed to fetch interview: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    if (USE_FIREBASE) {
      const { updateInterviewStatus } = await import('@/lib/firebase');
      await updateInterviewStatus(id, status);
    } else {
      const { updateInterviewStatus: updateMock } = await import('@/lib/db');
      await updateMock(id, status);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating interview:', error?.message || error);
    return NextResponse.json(
      { error: `Failed to update interview: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
