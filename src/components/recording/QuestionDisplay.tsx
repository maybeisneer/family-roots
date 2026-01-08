'use client';

import { motion } from 'framer-motion';

interface QuestionDisplayProps {
  questionNumber: number;
  questionText: string;
  totalQuestions?: number;
}

export function QuestionDisplay({ questionNumber, questionText, totalQuestions }: QuestionDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      key={questionNumber}
      className="text-center space-y-4"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
        <span className="text-amber-500 text-sm font-medium">
          Question {questionNumber}
          {totalQuestions && ` of ~${totalQuestions}`}
        </span>
      </div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-serif text-white leading-relaxed max-w-2xl mx-auto"
      >
        &ldquo;{questionText}&rdquo;
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-stone-500 text-sm"
      >
        Take your time. There&apos;s no limit.
      </motion.p>
    </motion.div>
  );
}

