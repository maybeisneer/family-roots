'use client';

import { motion } from 'framer-motion';

interface InterviewProgressProps {
  phase: 'exploring' | 'deepening' | 'wrapping_up' | 'final';
  responseCount: number;
  coveragePercent: number;
}

export function InterviewProgress({ phase, responseCount, coveragePercent }: InterviewProgressProps) {
  // Calculate progress percentage based on phase and coverage
  let progress = 0;
  if (phase === 'exploring') {
    progress = Math.min(40, responseCount * 8);
  } else if (phase === 'deepening') {
    progress = 40 + Math.min(30, (coveragePercent - 30) * 1);
  } else if (phase === 'wrapping_up') {
    progress = 70 + Math.min(20, (coveragePercent - 60) * 0.5);
  } else if (phase === 'final') {
    progress = 95;
  }

  // Only show progress if there's actual progress (hide initially)
  if (responseCount === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mb-4"
    >
      {/* Simple progress bar */}
      <div className="h-1.5 bg-stone-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500"
        />
      </div>

      {/* Simple counter */}
      <div className="flex justify-end mt-1.5">
        <span className="text-xs text-stone-500">
          {responseCount} {responseCount === 1 ? 'story' : 'stories'}
        </span>
      </div>
    </motion.div>
  );
}

