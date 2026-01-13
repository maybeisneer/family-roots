'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

// Placeholder testimonials - replace with real data
const TESTIMONIALS = [
  {
    id: 1,
    quote: "I finally got to hear stories about my grandmother's village that she never thought to share before. The AI knew exactly what questions to ask.",
    author: "Sarah Chen",
    relationship: "Recorded her grandmother",
    location: "San Francisco, CA",
    avatar: "/testimonials/avatar-1.jpg", // Placeholder - add your own
  },
  {
    id: 2,
    quote: "My dad opened up about his journey from Mexico in ways he never had before. Now my kids can watch it whenever they want.",
    author: "Miguel Rodriguez",
    relationship: "Recorded his father",
    location: "Austin, TX",
    avatar: "/testimonials/avatar-2.jpg", // Placeholder - add your own
  },
  {
    id: 3,
    quote: "We lost my grandfather last year, but we have hours of his stories preserved. It's the most valuable thing our family owns.",
    author: "Priya Sharma",
    relationship: "Recorded her grandfather",
    location: "Chicago, IL",
    avatar: "/testimonials/avatar-3.jpg", // Placeholder - add your own
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Track page view for TikTok Pixel
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('ViewContent', {
        content_type: 'product',
        content_id: 'landing-page',
        content_name: 'My House Tales Landing Page',
      });
    }
  }, []);

  return (
    <div className="min-h-screen gradient-warm">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-stone-200 font-serif font-bold text-lg hidden sm:inline">My House Tales</span>
          </Link>
          
          <nav>
            {loading ? (
              <div className="w-20 h-8 bg-stone-900/50 rounded-lg animate-pulse" />
            ) : user ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2 bg-stone-900/50 border border-stone-800 text-stone-200 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all"
                >
                  My Dashboard
                </motion.button>
              </Link>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2 text-stone-400 hover:text-stone-200 text-sm font-medium transition-all"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #fafaf9 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pb-32">
          {/* Logo/Brand Removed - using Header instead */}
          <div className="h-16" />

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left column - Text */}
            <div>
              {/* Main headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 mb-8"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
                  Preserve the stories
                  <br />
                  <span className="text-amber-500">that matter most</span>
                </h1>
                <p className="text-lg md:text-xl text-stone-400 max-w-xl leading-relaxed">
                  Capture your family&apos;s history through guided video interviews.
                  An AI helps ask the right questions, so no story gets lost.
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => {
                    if (user) {
                      router.push('/setup');
                    } else {
                      router.push('/login?redirect=/setup');
                    }
                  }}
                  className="px-8 py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
                >
                  Start an Interview
                </button>
                <a href="#how-it-works">
                  <button className="px-8 py-4 text-stone-400 hover:text-white transition-colors">
                    See how it works →
                  </button>
                </a>
              </motion.div>
            </div>

            {/* Right column - Video */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative flex justify-center md:justify-end"
            >
              <div className="relative w-[220px] md:w-[260px] lg:w-[280px]">
                {/* Video with rounded corners */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-[9/16] object-cover"
                  >
                    <source src="/videos/hero-demo.mp4" type="video/mp4" />
                  </video>
                </div>

                {/* Ambient glow */}
                <div className="absolute -inset-8 bg-amber-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Demo Section */}
      <div id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-amber-500 text-sm font-medium mb-4">See it in action</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
            How It Works
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Watch how easy it is to capture your family&apos;s stories
          </p>
        </motion.div>

        {/* Demo Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-video object-cover"
          >
            <source src="/videos/demo.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Feature 1 */}
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-200">AI-Guided Questions</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Our AI asks thoughtful follow-up questions based on their responses, 
              uncovering stories they might not think to share.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-200">Video Recording</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Simple, pressure-free recording. No time limits. 
              The focus is on their story, not the technology.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-200">Share with Family</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              A beautiful playback experience with transcripts. 
              Share the link so the whole family can watch together.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-amber-500 text-sm font-medium mb-4">Stories from families like yours</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white">
            Preserving memories that matter
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-stone-900/50 border border-stone-800 rounded-2xl"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-amber-500/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-stone-300 leading-relaxed">
                  {testimonial.quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center overflow-hidden">
                  {/* Replace with actual image when available */}
                  <span className="text-lg font-medium text-stone-500">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </span>
                  {/* Uncomment when you have images:
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                  */}
                </div>
                <div>
                  <p className="font-medium text-stone-200">{testimonial.author}</p>
                  <p className="text-sm text-stone-500">{testimonial.relationship}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* UGC Video Carousel Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-amber-500 text-sm font-medium mb-4">Moments worth preserving</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
            Stories captured forever
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Watch how families are preserving their most precious memories
          </p>
        </motion.div>

        {/* Video Carousel */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide justify-center">
          {['/videos/ugc-1.mp4', '/videos/ugc-2.mp4', '/videos/ugc-3.mp4'].map((video, index) => (
            <motion.div
              key={video}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-center"
            >
              <div className="relative w-[200px] md:w-[240px] rounded-2xl overflow-hidden shadow-xl shadow-black/30">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[9/16] object-cover"
                >
                  <source src={video} type="video/mp4" />
                </video>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Perfect for immigrants section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 md:p-12 bg-stone-900/50 border border-stone-800 rounded-2xl"
        >
          <div className="max-w-2xl">
            <p className="text-amber-500 text-sm font-medium mb-4">Perfect for immigrant families</p>
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
              Capture stories from the homeland before they&apos;re gone
            </h2>
            <p className="text-stone-400 leading-relaxed">
              Your parents and grandparents carry decades of stories—about the villages 
              they grew up in, the families they left behind, the journeys they took. 
              These stories are precious, but they&apos;re not written down anywhere. 
              Don&apos;t let them be lost.
            </p>
            <ul className="mt-6 space-y-2 text-stone-400">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Works in any language they&apos;re comfortable with
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No time pressure—they can take breaks anytime
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Transcription for easy sharing across generations
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
            Start preserving your family&apos;s stories today
          </h2>
          <p className="text-stone-400 mb-8 max-w-xl mx-auto">
            It only takes a few minutes to set up. Send the link to your loved one and let them share at their own pace.
          </p>
          <button
            onClick={() => {
              if (user) {
                router.push('/setup');
              } else {
                router.push('/login?redirect=/setup');
              }
            }}
            className="px-8 py-4 bg-amber-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
          >
            Start an Interview — $49.99
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-stone-900">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-600">
            <div className="w-6 h-6 bg-amber-500/50 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-sm">My House Tales</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-600">
            <Link href="/terms" className="hover:text-stone-400 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-stone-400 transition-colors">
              Privacy
            </Link>
            <a href="mailto:hey@neer.is" className="hover:text-stone-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
