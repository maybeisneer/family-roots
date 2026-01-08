import { NextRequest, NextResponse } from 'next/server';

// This route is no longer used - uploads now happen entirely client-side
// Keeping for backwards compatibility

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This endpoint is deprecated. Use client-side Firebase SDK directly.',
    info: 'Video upload and metadata updates now happen client-side.'
  }, { status: 410 }); // 410 Gone
}

