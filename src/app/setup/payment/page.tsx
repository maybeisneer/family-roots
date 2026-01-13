'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator } from '@/components/setup/StepIndicator';
import { getSetupState } from '@/lib/storage';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizerName, setOrganizerName] = useState('');
  const [intervieweeName, setIntervieweeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    const state = getSetupState();
    setOrganizerName(state.organizer_name || '');
    setIntervieweeName(state.interviewee_name || '');
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError('');

    // Track Initiate Checkout for TikTok
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('InitiateCheckout', {
        contents: [
          {
            content_id: 'my-house-tales-interview',
            content_type: 'product',
            content_name: 'My House Tales Interview',
          }
        ],
        value: 49.99,
        currency: 'USD',
      });
      // Small delay to ensure event is sent before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerName,
          intervieweeName,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress */}
      <div className="p-6">
        <StepIndicator currentStep={7} totalSteps={7} />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif text-white">
              Create {intervieweeName ? `${intervieweeName}'s` : 'the'} interview
            </h1>
            <p className="text-stone-400">
              One-time payment. Keep the memories forever.
            </p>
          </div>

          {cancelled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            >
              <p className="text-sm text-amber-200 text-center">
                Payment was cancelled. Ready when you are.
              </p>
            </motion.div>
          )}

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl space-y-6"
          >
            {/* Price */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-white">$49.99</span>
                <span className="text-stone-500">USD</span>
              </div>
              <p className="text-stone-500 text-sm mt-1">One-time payment</p>
            </div>

            {/* What's included */}
            <div className="space-y-3">
              <p className="text-xs text-stone-500 uppercase tracking-wide">
                What&apos;s included
              </p>
              <ul className="space-y-2">
                {[
                  'AI-guided interview with thoughtful follow-ups',
                  'Video recording stored securely forever',
                  'Automatic transcription in any language',
                  'Beautiful cinematic viewing experience',
                  'Share with family members',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-stone-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay & Create Interview
              </>
            )}
          </motion.button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 text-stone-600 text-xs">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure payment
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              Powered by Stripe
            </div>
          </div>

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
