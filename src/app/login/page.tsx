'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithGoogle, auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const { user, loading } = useAuth();
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isRedirecting = searchParams.has('redirect');

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsSigningIn(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gradient-warm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-stone-900/50 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-white">
            {isRedirecting ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-stone-400">
            {isRedirecting 
              ? 'Join Family Roots to save and manage your family stories' 
              : 'Sign in to manage your family stories'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full py-4 bg-white text-stone-900 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-stone-100 transition-all disabled:opacity-50"
        >
          {isSigningIn ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full"
            />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-stone-500 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

