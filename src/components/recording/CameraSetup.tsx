'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CameraSetupProps {
  stream: MediaStream | null;
  onStartRecording: () => void;
  intervieweeName: string;
}

export function CameraSetup({ stream, onStartRecording, intervieweeName }: CameraSetupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif text-white">
            Let's get you set up, {intervieweeName}
          </h1>
          <p className="text-stone-400">
            Position yourself in the frame before we begin
          </p>
        </div>

        {/* Video Preview with Guide Overlay */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border-2 border-amber-500/30">
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Face Guide Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-48 h-64 md:w-56 md:h-72"
            >
              {/* Oval guide */}
              <div className="absolute inset-0 border-3 border-dashed border-amber-500/50 rounded-full" 
                   style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
              />
              
              {/* Corner guides */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-3 border-l-3 border-amber-500 rounded-tl-lg" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-3 border-r-3 border-amber-500 rounded-tr-lg" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-3 border-l-3 border-amber-500 rounded-bl-lg" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-3 border-r-3 border-amber-500 rounded-br-lg" />
            </motion.div>
          </div>

          {/* Recording indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="text-xs text-white font-medium">Camera Active</span>
          </div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-stone-900/50 border border-stone-800 rounded-xl space-y-3"
        >
          <h3 className="text-sm font-medium text-stone-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips for the best recording
          </h3>
          <ul className="space-y-2 text-sm text-stone-400">
            <li className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>Center your face in the frame</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>Make sure you're well-lit (face the light source)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>Check your background is tidy and not distracting</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>Find a quiet space with minimal background noise</span>
            </li>
          </ul>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartRecording}
          disabled={!stream}
          className="w-full py-4 md:py-5 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stream ? '✓ Start Recording' : 'Waiting for camera...'}
        </motion.button>

        <p className="text-xs text-center text-stone-600">
          Once you start, the video will be blurred so you can focus on your story
        </p>
      </motion.div>
    </div>
  );
}

