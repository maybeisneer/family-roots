'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator, SETUP_STEPS } from '@/components/setup/StepIndicator';
import { RELATIONSHIPS } from '@/lib/questions';
import { getSetupState, setSetupState } from '@/lib/storage';
import { trackEvent } from '@/lib/firebase';

export default function SetupStep1() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [relationship, setRelationship] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const state = getSetupState();
    setName(state.interviewee_name);
    setAge(state.interviewee_age);
    setRelationship(state.relationship);
    setIsLoaded(true);

    // Track setup started for TikTok Pixel (AddToCart = started funnel)
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('AddToCart', {
        content_type: 'product',
        content_id: 'my-house-tales-interview',
        content_name: 'My House Tales Interview',
        value: 49.99,
        currency: 'USD',
      });
    }
    // Firebase Analytics
    trackEvent('begin_checkout', { step: 1, page: 'setup_interviewee' });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Please enter their name';
    }
    if (!relationship) {
      newErrors.relationship = 'Please select your relationship';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setSetupState({
        interviewee_name: name,
        interviewee_age: age,
        relationship,
      });
      router.push('/setup/location');
    }
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
      <StepIndicator steps={SETUP_STEPS} currentStep={1} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif text-white">
          Who would you like to interview?
        </h1>
        <p className="text-stone-500">
          Let&apos;s capture their story for your family
        </p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Their name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Maria"
            className="w-full"
          />
          {errors.name && (
            <p className="text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Age (optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Their age <span className="text-stone-600">(optional)</span>
          </label>
          <input
            type="number"
            value={age || ''}
            onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g., 72"
            className="w-full"
            min={1}
            max={120}
          />
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Your relationship to them
          </label>
          <div className="grid grid-cols-2 gap-3">
            {RELATIONSHIPS.map((rel) => (
              <motion.button
                key={rel.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRelationship(rel.value)}
                className={`
                  p-4 rounded-xl border text-left transition-all duration-200
                  ${relationship === rel.value
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                    : 'bg-stone-900/30 border-stone-800 text-stone-400 hover:border-stone-700'
                  }
                `}
              >
                {rel.label}
              </motion.button>
            ))}
          </div>
          {errors.relationship && (
            <p className="text-sm text-red-400">{errors.relationship}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
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
