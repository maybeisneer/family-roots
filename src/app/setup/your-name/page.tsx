'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator } from '@/components/setup/StepIndicator';

export default function YourNamePage() {
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState('');
  const [intervieweeName, setIntervieweeName] = useState('');

  useEffect(() => {
    // Load existing data
    const saved = localStorage.getItem('family_roots_setup');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.organizer_name) setOrganizerName(data.organizer_name);
      if (data.interviewee_name) setIntervieweeName(data.interviewee_name);
    }
  }, []);

  const handleContinue = () => {
    if (!organizerName.trim()) return;

    // Save to localStorage
    const saved = localStorage.getItem('family_roots_setup');
    const data = saved ? JSON.parse(saved) : {};
    localStorage.setItem('family_roots_setup', JSON.stringify({
      ...data,
      organizer_name: organizerName.trim(),
    }));

    router.push('/setup/ready');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && organizerName.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress */}
      <div className="p-6">
        <StepIndicator currentStep={6} totalSteps={7} />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif text-white">
              And who are you?
            </h1>
            <p className="text-stone-400">
              We&apos;ll let {intervieweeName || 'them'} know you&apos;re the one asking
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-2">
                Your first name
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Sarah"
                className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Preview of what interviewee will see */}
          {organizerName.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-stone-900/50 border border-stone-800 rounded-xl"
            >
              <p className="text-xs text-stone-500 mb-2">
                {intervieweeName || 'They'} will see:
              </p>
              <p className="text-stone-200 font-serif">
                &ldquo;<span className="text-amber-500">{organizerName}</span> wants you to share your story for future generations&rdquo;
              </p>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!organizerName.trim()}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500"
          >
            Continue
          </motion.button>

          <button
            onClick={() => router.back()}
            className="w-full py-3 text-stone-500 hover:text-stone-300 transition-colors"
          >
            Back
          </button>
        </motion.div>
      </main>
    </div>
  );
}

