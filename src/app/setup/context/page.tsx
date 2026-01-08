'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator } from '@/components/setup/StepIndicator';
import { getSetupState, setSetupState } from '@/lib/storage';

export default function ContextPage() {
  const router = useRouter();
  const [context, setContext] = useState('');
  const [intervieweeName, setIntervieweeName] = useState('');

  useEffect(() => {
    const state = getSetupState();
    if (!state.interviewee_name) {
      router.push('/setup');
      return;
    }
    setIntervieweeName(state.interviewee_name);
    setContext(state.context || '');
  }, [router]);

  const handleNext = () => {
    setSetupState({ context });
    router.push('/setup/questions');
  };

  const handleSkip = () => {
    setSetupState({ context: '' });
    router.push('/setup/questions');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <StepIndicator currentStep={4} />

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl space-y-8"
        >
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif text-white">
              Tell us about {intervieweeName}
            </h1>
            <p className="text-stone-400 text-lg">
              Share any interesting details, hobbies, life events, or unique aspects about them. 
              This helps us ask more meaningful questions.
            </p>
          </div>

          <div className="space-y-4">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="For example:
• She's an incredible cook and taught me everything I know about food
• He was a civil engineer who designed bridges across the country
• She immigrated alone at 18 with just a suitcase
• He loves gardening and has a legendary vegetable patch
• She was the first woman in her family to go to university"
              className="w-full h-48 px-6 py-4 bg-stone-900 border border-stone-700 rounded-2xl text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-200">
                The more specific you are, the better! This context helps us craft questions that will capture their unique story.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSkip}
              className="flex-1 py-4 border border-stone-700 text-stone-300 rounded-xl font-medium hover:border-stone-600 hover:text-white transition-colors"
            >
              Skip for now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!context.trim()}
              className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </motion.button>
          </div>

          <button
            onClick={() => router.push('/setup/language')}
            className="w-full text-center text-stone-500 hover:text-stone-300 transition-colors text-sm"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}

