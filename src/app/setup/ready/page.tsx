'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { StepIndicator } from '@/components/setup/StepIndicator';
import { getSetupState, clearSetupState } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { signInWithGoogle, createInterview, trackEvent } from '@/lib/firebase';
import Link from 'next/link';

export default function SetupReadyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizerName, setOrganizerName] = useState('');
  const [intervieweeName, setIntervieweeName] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const state = getSetupState();
    setOrganizerName(state.organizer_name || '');
    setIntervieweeName(state.interviewee_name || '');

    // Verify payment was completed
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Payment required. Please complete checkout first.');
      setIsCreating(false);
      return;
    }

    const initInterview = async () => {
      setIsCreating(true);
      setError('');

      // Double-check we have user ID
      if (!user?.uid) {
        console.error('No user ID available');
        setError('Please sign in to create an interview.');
        setIsCreating(false);
        return;
      }

      try {
        // Verify payment with Stripe
        const verifyResponse = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!verifyResponse.ok) {
          const verifyError = await verifyResponse.json();
          if (verifyResponse.status === 402) {
            setError('Payment not completed. Please complete checkout first.');
          } else {
            setError(verifyError.error || 'Could not verify payment.');
          }
          setIsCreating(false);
          return;
        }

        const payload = {
          organizer_id: user.uid,  // Now guaranteed to exist
          organizer_name: state.organizer_name,
          organizer_email: user.email || undefined,  // For email notifications
          interviewee_name: state.interviewee_name,
          interviewee_age: state.interviewee_age,
          relationship: state.relationship,
          birthplace: state.birthplace,
          current_location: state.current_location,
          language: state.language,
          questions: state.suggested_questions?.map(q => q.question_text) || [],
        };

        console.log('Creating interview directly from client...', payload);

        // Call Firebase directly from client
        const result = await createInterview(payload);

        const baseUrl = window.location.origin;
        const newInterviewLink = `${baseUrl}/interview/${result.interview_link_code}`;
        setInterviewLink(newInterviewLink);

        // Send email with interview link to organizer
        if (user.email) {
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'interview-link',
                to: user.email,
                organizerName: state.organizer_name,
                intervieweeName: state.interviewee_name,
                interviewLink: newInterviewLink,
              }),
            });
            console.log('✅ Interview link email sent');
          } catch (emailErr) {
            console.error('Failed to send interview link email:', emailErr);
          }
        }

        // Track purchase conversion for TikTok
        if (typeof window !== 'undefined' && (window as any).ttq) {
          (window as any).ttq.track('CompletePayment', {
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
        }
        // Firebase Analytics
        trackEvent('purchase', { value: 49.99, currency: 'USD', transaction_id: result.id });

        // Clear setup state after successful creation
        clearSetupState();
      } catch (err: any) {
        console.error('Error creating interview:', err);
        setError(err.message || 'Something went wrong. Please check your connection.');
      } finally {
        setIsCreating(false);
      }
    };

    // Only create interview when user is authenticated
    if (!authLoading && user) {
      initInterview();
    }
  }, [user, authLoading, searchParams]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // The useEffect will trigger again with the user
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(interviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = interviewLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = `${organizerName ? `${organizerName} wants` : 'Someone wants'} you to share your story for future generations. Click here to begin your interview:`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My House Tales - Share Your Story',
          text: shareText,
          url: interviewLink,
        });
      } catch {
        // User cancelled or error - fallback to copy
        handleCopy();
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="p-6">
          <StepIndicator currentStep={7} totalSteps={7} />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full"
            />
            <p className="text-stone-400">Creating your interview...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col p-6">
        <StepIndicator currentStep={6} totalSteps={6} />
        <main className="flex-1 flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif text-white">Oops! Something went wrong</h1>
            <p className="text-stone-400 text-sm leading-relaxed">{error}</p>
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-400 transition-colors"
            >
              Retry
            </button>
            <p className="text-xs text-stone-600">
              Check if you have enabled **Firestore Database** and **Storage** in the Firebase Console.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress */}
      <div className="p-6">
        <StepIndicator currentStep={6} totalSteps={6} />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Success icon */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h1 className="text-3xl font-serif text-white mb-2">
              You&apos;re all set!
            </h1>
            <p className="text-stone-400">
              Share this link with {intervieweeName || 'them'} to begin
            </p>
          </div>

          {error && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-sm text-amber-200">{error}</p>
            </div>
          )}

          {/* Preview card - what they'll see */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl space-y-4"
          >
            <p className="text-xs text-stone-500 uppercase tracking-wide">
              {intervieweeName || 'They'} will see:
            </p>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-xl font-serif text-white leading-relaxed">
                {organizerName ? (
                  <>
                    <span className="text-amber-500">{organizerName}</span> wants you to share your story for future generations
                  </>
                ) : (
                  'Someone wants you to share your story for future generations'
                )}
              </p>
              <p className="text-stone-500 text-sm">
                Your answers will be recorded and preserved for your family.
              </p>
            </div>
          </motion.div>

          {/* Link and actions */}
          <div className="space-y-4">
            {/* Link display */}
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
              <p className="text-xs text-stone-500 mb-2">Interview link</p>
              <p className="text-amber-500 text-sm break-all font-mono">
                {interviewLink}
              </p>
              {user?.email && (
                <p className="text-xs text-stone-500 mt-2">
                  Also sent to {user.email} (check spam)
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="py-3 px-4 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </motion.button>
            </div>
          </div>

          {/* Next steps */}
          <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4">
            <p className="text-sm text-stone-400">
              <span className="text-amber-500 font-medium">What happens next?</span>
              <br />
              Once {intervieweeName || 'they'} complete{intervieweeName ? 's' : ''} the interview, 
              you&apos;ll be able to watch the recording in your dashboard.
            </p>
            
            {user ? (
              <Link href="/dashboard" className="block w-full">
                <button className="w-full py-2 bg-stone-800 text-stone-300 rounded-lg text-sm hover:text-white transition-colors">
                  Go to Dashboard →
                </button>
              </Link>
            ) : (
              <div className="pt-2 border-t border-stone-800">
                <p className="text-xs text-stone-500 mb-2 italic">Don&apos;t lose this link! Sign in to save it to your account.</p>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
                >
                  {isSigningIn ? 'Signing in...' : 'Sign in with Google to save →'}
                </button>
              </div>
            )}
          </div>

          {/* Start another */}
          <a
            href="/"
            className="block text-center py-3 text-stone-500 hover:text-stone-300 transition-colors"
          >
            Create another interview
          </a>
        </motion.div>
      </main>
    </div>
  );
}
