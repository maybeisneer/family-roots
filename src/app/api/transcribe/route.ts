import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

interface WhisperChunk {
  text: string;
  timestamp: [number, number | null];
}

interface WhisperOutput {
  text: string;
  chunks: WhisperChunk[];
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, responseId } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.warn('REPLICATE_API_TOKEN not set, skipping transcription');
      return NextResponse.json({ 
        transcript: '', 
        segments: [],
        error: 'Transcription not configured' 
      });
    }

    console.log(`🎤 Starting Whisper transcription for response: ${responseId}`);
    console.log(`📹 Video URL: ${videoUrl.substring(0, 100)}...`);

    const replicate = new Replicate({
      auth: apiToken,
    });

    // Run incredibly-fast-whisper with chunk-level timestamps
    // Using specific version hash for community models
    let output: WhisperOutput;
    try {
      output = await replicate.run(
        "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
        {
          input: {
            audio: videoUrl,
            task: "transcribe",
            timestamp: "chunk",
            batch_size: 24,
            diarise_audio: false,
          }
        }
      ) as WhisperOutput;
    } catch (replicateError: any) {
      console.error('Replicate API error:', replicateError);
      // Return empty result instead of 500 - audio might be silent/empty
      return NextResponse.json({
        transcript: '',
        segments: [],
        warning: 'Could not transcribe audio - it may be silent or too short',
      });
    }

    console.log('📝 Raw Whisper output:', JSON.stringify(output).substring(0, 1000));

    // Handle empty output (silent audio)
    if (!output || !output.text) {
      console.log('⚠️ No speech detected in audio');
      return NextResponse.json({
        transcript: '',
        segments: [],
        warning: 'No speech detected in audio',
      });
    }

    // Handle different output formats from Replicate
    let segments: { text: string; startTime: number; endTime: number }[] = [];
    
    if (output.chunks && Array.isArray(output.chunks)) {
      segments = output.chunks
        .filter(chunk => chunk.text && chunk.timestamp)
        .map((chunk, index, arr) => ({
          text: chunk.text.trim(),
          startTime: chunk.timestamp[0] || 0,
          endTime: chunk.timestamp[1] || 
            (arr[index + 1]?.timestamp[0]) || 
            (chunk.timestamp[0] + 3),
        }));
    }

    console.log(`✅ Transcription complete: ${segments.length} phrase segments`);

    return NextResponse.json({
      transcript: output.text || '',
      segments,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    // Return empty result instead of 500 for graceful degradation
    return NextResponse.json({
      transcript: '',
      segments: [],
      error: 'Transcription failed',
      details: String(error),
    });
  }
}

