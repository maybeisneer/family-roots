'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { RecordingUIStrings } from '@/lib/translations';

interface BlurredVideoPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isPaused?: boolean;
  questionText?: string;
  questionNumber?: number;
  uiStrings?: RecordingUIStrings | null;
}

export function BlurredVideoPreview({ stream, isRecording, isPaused = false, questionText, questionNumber, uiStrings }: BlurredVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Error playing video preview:", e));
    }
  }, [stream]);

  useEffect(() => {
    if (!stream || !canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const drawBlurred = () => {
      // Check if video is actually playing and has data
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw video frame with subtle blur
        ctx.filter = 'blur(30px) saturate(1.2) brightness(0.7)'; // Increased blur/darkness for better text contrast
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        
        ctx.filter = 'none';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      animationId = requestAnimationFrame(drawBlurred);
    };

    drawBlurred();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden bg-stone-900">
      {/* Hidden video element for source */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden"
      />
      
      {/* Blurred canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Question overlaid on video */}
      {questionText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12"
        >
          {/* Question number badge */}
          {questionNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-1.5 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full mb-6"
            >
              <span className="text-amber-500 text-sm font-medium">
                {uiStrings?.questionPrefix || 'Question'} {questionNumber}
              </span>
            </motion.div>
          )}

          {/* Question text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-serif text-white text-center max-w-3xl leading-relaxed"
          >
            {questionText}
          </motion.h2>

          {/* Subtle instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-stone-300 text-sm md:text-base"
          >
            {uiStrings?.takeYourTime || "Take your time. There's no limit."}
          </motion.p>
        </motion.div>
      )}

      {/* Recording/Paused indicator */}
      {(isRecording || isPaused) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 ${
            isPaused ? 'bg-amber-500/90' : 'bg-red-500/90'
          } rounded-full`}
        >
          {!isPaused && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
          {isPaused && (
            <div className="w-2 h-2 bg-white rounded-sm" />
          )}
          <span className="text-white text-xs font-medium">
            {isPaused ? (uiStrings?.paused || 'Paused') : (uiStrings?.recording || 'Recording')}
          </span>
        </motion.div>
      )}

      {/* Camera permission prompt */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm">
              Camera access needed
            </p>
          </div>
        </div>
      )}

      {/* Subtle border glow when recording */}
      {isRecording && !isPaused && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2 border-amber-500/30 pointer-events-none"
        />
      )}
    </div>
  );
}

