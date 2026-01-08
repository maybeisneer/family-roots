'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ShareLinkProps {
  interviewLink: string;
  intervieweeName: string;
}

export function ShareLink({ interviewLink, intervieweeName }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(interviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Share your story - Family Roots Interview`);
    const body = encodeURIComponent(
      `Hi ${intervieweeName},\n\nI'd love to hear your story and preserve it for our family. I've set up an interview for you - just click the link below when you're ready:\n\n${interviewLink}\n\nTake your time, there's no rush. Your stories matter.\n\nWith love`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const text = encodeURIComponent(
      `Hi ${intervieweeName}! I'd love to hear your story. Click here when you're ready to share: ${interviewLink}`
    );
    window.open(`sms:?body=${text}`);
  };

  return (
    <div className="space-y-6">
      {/* Success message */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white">
          Interview Ready!
        </h2>
        <p className="text-stone-400">
          Share this link with {intervieweeName} to begin the interview
        </p>
      </motion.div>

      {/* Link box */}
      <div className="relative">
        <div className="flex items-center gap-2 p-4 bg-stone-800/50 border border-stone-700 rounded-xl">
          <div className="flex-1 font-mono text-sm text-stone-300 truncate">
            {interviewLink}
          </div>
          <button
            onClick={copyToClipboard}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-amber-500 text-white hover:bg-amber-400'
              }
            `}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </span>
            ) : (
              'Copy Link'
            )}
          </button>
        </div>
      </div>

      {/* Share options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={shareViaEmail}
          className="flex items-center justify-center gap-2 p-4 bg-stone-800/30 border border-stone-700 rounded-xl text-stone-300 hover:bg-stone-800/50 hover:border-stone-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </button>
        <button
          onClick={shareViaSMS}
          className="flex items-center justify-center gap-2 p-4 bg-stone-800/30 border border-stone-700 rounded-xl text-stone-300 hover:bg-stone-800/50 hover:border-stone-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Text Message
        </button>
      </div>

      {/* What happens next */}
      <div className="p-4 bg-stone-800/30 border border-stone-700 rounded-xl space-y-3">
        <h3 className="font-medium text-stone-200">What happens next?</h3>
        <ul className="space-y-2 text-sm text-stone-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-500">1.</span>
            {intervieweeName} opens the link and starts the interview
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">2.</span>
            They answer questions at their own pace (no time limit)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">3.</span>
            The AI asks thoughtful follow-up questions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">4.</span>
            When complete, you&apos;ll get a link to watch and share with family
          </li>
        </ul>
      </div>
    </div>
  );
}

