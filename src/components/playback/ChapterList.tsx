'use client';

import { motion } from 'framer-motion';
import type { Response } from '@/types';

interface ChapterListProps {
  responses: Response[];
  currentIndex: number;
  onSelectChapter: (index: number) => void;
}

export function ChapterList({ responses, currentIndex, onSelectChapter }: ChapterListProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-stone-800">
        <h2 className="font-semibold text-stone-200">Chapters</h2>
        <p className="text-sm text-stone-500">{responses.length} responses</p>
      </div>

      <div className="divide-y divide-stone-800/50">
        {responses.map((response, index) => (
          <motion.button
            key={response.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectChapter(index)}
            className={`
              w-full p-4 text-left transition-all duration-200
              ${currentIndex === index 
                ? 'bg-amber-500/10 border-l-2 border-amber-500' 
                : 'hover:bg-stone-800/50 border-l-2 border-transparent'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Chapter number */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${currentIndex === index 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-stone-800 text-stone-500'
                }
              `}>
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                {/* Question */}
                <p className={`
                  text-sm line-clamp-2
                  ${currentIndex === index ? 'text-amber-200' : 'text-stone-300'}
                `}>
                  {response.question_text}
                </p>

                {/* Duration */}
                <p className="mt-1 text-xs text-stone-600">
                  {formatDuration(response.duration_seconds)}
                </p>
              </div>

              {/* Playing indicator */}
              {currentIndex === index && (
                <div className="flex-shrink-0 flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: ['8px', '16px', '8px'],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-0.5 bg-amber-500 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

