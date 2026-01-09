'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator, SETUP_STEPS } from '@/components/setup/StepIndicator';
import { LANGUAGES } from '@/lib/questions';
import { getSetupState, setSetupState } from '@/lib/storage';

export default function SetupStep3() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const state = getSetupState();
    setName(state.interviewee_name);
    setLanguage(state.language);
    setIsLoaded(true);
  }, []);

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    setSetupState({ language });
    router.push('/setup/context');
  };

  const handleBack = () => {
    router.push('/setup/location');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StepIndicator steps={SETUP_STEPS} currentStep={3} />

      <div className="text-center space-y-3">
        <h1 className="text-2xl font-serif text-white">
          What language will {name || 'they'} speak?
        </h1>
        <p className="text-stone-400">
          {name || 'They'} can record the interview in any language.
          <br />
          <span className="text-stone-500">Questions will be shown in this language, and we&apos;ll transcribe their answers automatically.</span>
        </p>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages..."
          className="w-full"
        />

        {/* Language grid */}
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
          {filteredLanguages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage(lang.code)}
              className={`
                p-3 rounded-lg border text-left transition-all duration-200
                ${language === lang.code
                  ? 'bg-amber-500/20 border-amber-500'
                  : 'bg-stone-900/30 border-stone-800 hover:border-stone-700'
                }
              `}
            >
              <div className={`font-medium ${language === lang.code ? 'text-amber-200' : 'text-stone-300'}`}>
                {lang.name}
              </div>
              <div className="text-sm text-stone-500">
                {lang.nativeName}
              </div>
            </motion.button>
          ))}
        </div>

        {filteredLanguages.length === 0 && (
          <p className="text-center text-stone-500 py-4">
            No languages found. Try a different search.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-stone-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="px-8 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-400 transition-colors"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
