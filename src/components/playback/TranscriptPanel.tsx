'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}

interface TranscriptPanelProps {
  transcript: string;
  segments?: TranscriptSegment[];
  currentTime: number;
  onSeek?: (time: number) => void;
}

export function TranscriptPanel({ transcript, segments, currentTime, onSeek }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  // If we have segments, render with time-synced highlighting
  if (segments && segments.length > 0) {
    return (
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto p-4 space-y-1"
      >
        {segments.map((segment, index) => {
          const isActive = currentTime >= segment.startTime && currentTime < segment.endTime;
          const isPast = currentTime >= segment.endTime;
          
          return (
            <motion.span
              key={index}
              ref={isActive ? activeRef : null}
              onClick={() => onSeek?.(segment.startTime)}
              className={`
                inline cursor-pointer transition-all duration-200
                ${isActive 
                  ? 'text-amber-400 bg-amber-500/20 px-1 rounded' 
                  : isPast 
                    ? 'text-stone-400' 
                    : 'text-stone-500 hover:text-stone-300'
                }
              `}
            >
              {segment.text}{' '}
            </motion.span>
          );
        })}
      </div>
    );
  }

  // Fallback: render plain transcript
  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">
        {transcript || 'Transcript will appear here...'}
      </p>
    </div>
  );
}

