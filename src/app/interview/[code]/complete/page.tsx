'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getInterviewByCode, updateResponse } from '@/lib/firebase';
import type { Response } from '@/types';

export default function InterviewCompletePage() {
  const params = useParams();
  const code = params.code as string;

  const [processingStage, setProcessingStage] = useState<'transcribing' | 'translating' | 'complete' | 'error'>('transcribing');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch interview and trigger Whisper transcription + translation
  useEffect(() => {
    const processInterview = async () => {
      try {
        // Get interview data
        const interview = await getInterviewByCode(code);
        if (!interview || !interview.responses) return;
        
        const responsesWithVideo = interview.responses.filter((r: Response) => r.video_url);
        setTotalCount(responsesWithVideo.length);

        // Stage 1: Whisper transcription for word-level timestamps
        setProcessingStage('transcribing');
        
        for (let i = 0; i < responsesWithVideo.length; i++) {
          const response = responsesWithVideo[i];
          setProcessedCount(i + 1);
          
          try {
            // Call Whisper API
            const transcribeRes = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                videoUrl: response.video_url,
                responseId: response.id,
              }),
            });

            if (transcribeRes.ok) {
              const { transcript, segments } = await transcribeRes.json();
              
              // Update response with word-level segments
              if (segments && segments.length > 0) {
                await updateResponse(response.id, {
                  transcript: transcript || response.transcript,
                  transcript_segments: segments,
                });
                console.log(`✅ Transcribed response ${i + 1}/${responsesWithVideo.length}`);
              }
            }
          } catch (err) {
            console.error(`Error transcribing response ${response.id}:`, err);
            // Continue with other responses
          }
        }

        // Stage 2: Translation
        setProcessingStage('translating');
        setProcessedCount(0);

        const translateRes = await fetch(`/api/interviews/${interview.id}/translate`, {
          method: 'POST',
        });

        // Track interview completion for TikTok Pixel
        if (typeof window !== 'undefined' && (window as any).ttq) {
          (window as any).ttq.track('CompleteRegistration', {
            content_type: 'product',
            content_id: 'my-house-tales-interview',
            content_name: 'Interview Completed',
          });
        }

        // Send email notification to organizer
        if (interview.organizer_email) {
          const watchUrl = `${window.location.origin}/watch/${code}`;
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: interview.organizer_email,
                intervieweeName: interview.interviewee_name,
                watchUrl,
              }),
            });
            console.log('✅ Notification email sent to organizer');
          } catch (emailErr) {
            console.error('Failed to send notification email:', emailErr);
            // Don't fail the whole process if email fails
          }
        }

        if (translateRes.ok) {
          setProcessingStage('complete');
        } else {
          setProcessingStage('complete'); // Still mark complete even if translation fails
        }
      } catch (err) {
        console.error('Error processing interview:', err);
        setProcessingStage('error');
      }
    };

    processInterview();
  }, [code]);

  const playbackLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/watch/${code}?from=complete`;

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-white">
            Thank you for sharing
          </h1>
          <p className="text-stone-400">
            Your stories are now preserved for your family
          </p>
        </div>

        {/* Processing status */}
        {processingStage === 'transcribing' && totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-amber-500 text-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
              />
              Creating word-by-word captions... ({processedCount}/{totalCount})
            </div>
            <div className="w-48 mx-auto h-1 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${(processedCount / totalCount) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {processingStage === 'translating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-blue-500 text-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
            />
            Preparing translations for your family...
          </motion.div>
        )}

        {processingStage === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-emerald-500 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Cinematic captions ready!
          </motion.div>
        )}

        {/* Main CTA: Watch Link */}
        <div className="space-y-4">
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
            <p className="text-stone-300 font-medium italic">
              &ldquo;Your voice is the bridge between the past and the future.&rdquo;
            </p>
            <Link href={playbackLink} className="block w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-amber-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Your Story Now
              </motion.button>
            </Link>
          </div>

          <p className="text-xs text-stone-500">
            This link is private and accessible only to your family members who have it.
          </p>
        </div>

        {/* Share with Family */}
        <div className="pt-8 border-t border-stone-900 flex justify-between items-center text-sm">
          <Link href="/" className="text-stone-500 hover:text-stone-300 transition-colors">
            ← Back to Home
          </Link>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(playbackLink);
              alert('Playback link copied to clipboard!');
            }}
            className="text-amber-500 hover:text-amber-400 font-medium"
          >
            Copy link for family
          </button>
        </div>

        {/* Viral CTA - Invite others */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 rounded-3xl space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="text-4xl">💝</div>
            <h3 className="text-2xl font-serif text-white">
              Give the gift of storytelling
            </h3>
            <p className="text-stone-400 max-w-md mx-auto">
              Know someone whose story deserves to be preserved? 
              Help them capture their memories for future generations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/setup" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-amber-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
              >
                Start Another Interview
              </motion.button>
            </Link>
            <button
              onClick={() => {
                const shareText = `I just preserved my family's story with My House Tales. It's an incredible way to capture memories for future generations. Check it out: ${window.location.origin}`;
                if (navigator.share) {
                  navigator.share({ text: shareText, url: window.location.origin });
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert('Link copied to clipboard!');
                }
              }}
              className="px-8 py-4 border border-amber-500/30 text-amber-500 rounded-xl font-medium hover:bg-amber-500/10 transition-colors"
            >
              Share with Friends
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
