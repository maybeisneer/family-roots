'use client';

import { motion } from 'framer-motion';
import type { RecordingUIStrings } from '@/lib/translations/index';

interface ProcessingStateProps {
  stage: 'uploading' | 'transcribing' | 'generating';
  uploadProgress?: number; // 0-100
  uiStrings?: RecordingUIStrings;
}

const icons = {
  uploading: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  transcribing: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  generating: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

// Default English messages
const defaultMessages = {
  uploading: 'Saving your response...',
  transcribing: 'Listening to what you shared...',
  generating: 'Preparing the next question...',
  thankYou: 'Thank you for sharing. Your stories are precious.',
};

export function ProcessingState({ stage, uploadProgress, uiStrings }: ProcessingStateProps) {
  // Get translated messages or fallback to defaults
  const messages = {
    uploading: uiStrings?.savingResponse || defaultMessages.uploading,
    transcribing: uiStrings?.listeningToYou || defaultMessages.transcribing,
    generating: uiStrings?.preparingNextQuestion || defaultMessages.generating,
    thankYou: uiStrings?.thankYouSharing || defaultMessages.thankYou,
  };
  
  const uploadingText = uiStrings?.uploadingProgress?.replace('{progress}', `${uploadProgress}`) 
    || `Uploading... ${uploadProgress}%`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-12 space-y-6"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ 
          rotate: stage === 'uploading' ? 0 : [0, 360],
        }}
        transition={{ 
          duration: 2,
          repeat: stage === 'uploading' ? 0 : Infinity,
          ease: 'linear',
        }}
        className="text-amber-500"
      >
        {icons[stage]}
      </motion.div>

      {/* Message with upload progress */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-lg text-stone-300">
          {stage === 'uploading' && uploadProgress !== undefined && uploadProgress < 100
            ? uploadingText
            : messages[stage]}
        </p>
        
        {/* Upload progress bar */}
        {stage === 'uploading' && uploadProgress !== undefined && (
          <div className="mt-4 w-48 mx-auto">
            <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Progress dots (only show when not uploading with progress) */}
      {!(stage === 'uploading' && uploadProgress !== undefined) && (
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-amber-500 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Encouraging message */}
      <p className="text-sm text-stone-500 max-w-xs text-center">
        {messages.thankYou}
      </p>
    </motion.div>
  );
}

