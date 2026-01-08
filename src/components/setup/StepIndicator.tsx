'use client';

import { motion } from 'framer-motion';

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps?: Step[];
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({ steps, currentStep, totalSteps }: StepIndicatorProps) {
  // Support both old interface (with steps array) and new simple interface
  const stepCount = totalSteps || steps?.length || 5;
  const displaySteps = steps || Array.from({ length: stepCount }, (_, i) => ({ number: i + 1, title: '' }));

  return (
    <div className="flex items-center justify-center gap-2">
      {displaySteps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative flex items-center justify-center w-8 h-8 rounded-full
              font-medium text-xs transition-all duration-300
              ${currentStep === step.number
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : currentStep > step.number
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-800 text-stone-500'
              }
            `}
          >
            {currentStep > step.number ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step.number
            )}
          </motion.div>
          
          {index < displaySteps.length - 1 && (
            <div
              className={`
                w-8 h-0.5 mx-1 transition-all duration-300
                ${currentStep > step.number ? 'bg-emerald-500' : 'bg-stone-800'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export const SETUP_STEPS: Step[] = [
  { number: 1, title: 'Who' },
  { number: 2, title: 'Where' },
  { number: 3, title: 'Language' },
  { number: 4, title: 'Context' },
  { number: 5, title: 'Questions' },
  { number: 6, title: 'You' },
  { number: 7, title: 'Share' },
];
