'use client';

import { motion } from 'framer-motion';
import type { RecordingUIStrings } from '@/lib/translations';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  uiStrings?: RecordingUIStrings | null;
}

export function RecordingControls({
  isRecording,
  isPaused,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  disabled,
  uiStrings,
}: RecordingControlsProps) {
  if (!isRecording) {
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartRecording}
        disabled={disabled}
        className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-full font-medium text-lg shadow-lg shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="w-4 h-4 bg-white rounded-full" />
        {uiStrings?.startRecording || 'Start Recording'}
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Pause/Resume button */}
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isPaused ? onResumeRecording : onPauseRecording}
        className="flex items-center gap-2 px-6 py-3 bg-stone-700 text-white rounded-full font-medium hover:bg-stone-600 transition-colors"
      >
        {isPaused ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {uiStrings?.resume || 'Resume'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            {uiStrings?.pause || 'Pause'}
          </>
        )}
      </motion.button>

      {/* Done button */}
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStopRecording}
        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-full font-medium text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {uiStrings?.done || 'Done'}
      </motion.button>
    </div>
  );
}

