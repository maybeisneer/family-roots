'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator, SETUP_STEPS } from '@/components/setup/StepIndicator';
import { getSetupState, setSetupState } from '@/lib/storage';

export default function SetupStep2() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const state = getSetupState();
    setName(state.interviewee_name);
    setBirthplace(state.birthplace);
    setCurrentLocation(state.current_location);
    setIsLoaded(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!birthplace.trim()) {
      newErrors.birthplace = 'Please enter where they were born';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setSetupState({
        birthplace,
        current_location: currentLocation,
      });
      router.push('/setup/language');
    }
  };

  const handleBack = () => {
    router.push('/setup');
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
      <StepIndicator steps={SETUP_STEPS} currentStep={2} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif text-white">
          Where {name ? `is ${name}` : 'are they'} from?
        </h1>
        <p className="text-stone-500">
          This helps us ask questions about their homeland
        </p>
      </div>

      <div className="space-y-6">
        {/* Birthplace */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Where were they born?
          </label>
          <input
            type="text"
            value={birthplace}
            onChange={(e) => setBirthplace(e.target.value)}
            placeholder="e.g., Punjab, India or Mexico City, Mexico"
            className="w-full"
          />
          {errors.birthplace && (
            <p className="text-sm text-red-400">{errors.birthplace}</p>
          )}
          <p className="text-xs text-stone-600">
            Be as specific as you&apos;d like—city, region, or country
          </p>
        </div>

        {/* Current location (optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Where do they live now? <span className="text-stone-600">(optional)</span>
          </label>
          <input
            type="text"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            placeholder="e.g., Los Angeles, California"
            className="w-full"
          />
        </div>
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
