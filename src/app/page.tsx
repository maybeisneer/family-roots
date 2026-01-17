'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/firebase';

// Live activity feed data - simulated social proof
const LIVE_ACTIVITIES = [
  { action: 'started an interview with', subject: 'their grandmother', location: 'Delhi', flag: '🇮🇳' },
  { action: 'is watching', subject: 'their grandfather\'s story', location: 'Toronto', flag: '🇨🇦' },
  { action: 'created an interview for', subject: 'their dad', location: 'Mexico City', flag: '🇲🇽' },
  { action: 'is watching', subject: 'their nana\'s memories', location: 'London', flag: '🇬🇧' },
  { action: 'started an interview with', subject: 'their mom', location: 'Sydney', flag: '🇦🇺' },
  { action: 'created an interview for', subject: 'their abuela', location: 'Miami', flag: '🇺🇸' },
  { action: 'is watching', subject: 'their grandmother\'s story', location: 'Berlin', flag: '🇩🇪' },
  { action: 'started an interview with', subject: 'their grandfather', location: 'Mumbai', flag: '🇮🇳' },
  { action: 'created an interview for', subject: 'their baba', location: 'Minsk', flag: '🇧🇾' },
  { action: 'is watching', subject: 'their family stories', location: 'São Paulo', flag: '🇧🇷' },
];

const FEATURES = [
  {
    number: '01',
    title: 'AI-Guided Questions',
    description: 'Thoughtful follow-up questions that uncover stories they might not think to share on their own.',
  },
  {
    number: '02',
    title: 'Video Recording',
    description: 'Simple, pressure-free recording with no time limits. The focus is entirely on their story.',
  },
  {
    number: '03',
    title: 'Private & Secure',
    description: 'Videos are only accessible to your family through a private link. No public sharing, ever.',
  },
  {
    number: '04',
    title: 'Share with Family',
    description: 'Beautiful playback experience with transcripts. Share the link so everyone can watch together.',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activityIndex, setActivityIndex] = useState(0);
  const [showActivity, setShowActivity] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  // Show live activity with random timing
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const scheduleNext = (isFirst: boolean) => {
      const delay = isFirst
        ? 2000 + Math.random() * 3000
        : 10000 + Math.random() * 50000;

      timeout = setTimeout(() => {
        // Randomly pick a different activity than current
        setActivityIndex((prev) => {
          let next = Math.floor(Math.random() * LIVE_ACTIVITIES.length);
          while (next === prev && LIVE_ACTIVITIES.length > 1) {
            next = Math.floor(Math.random() * LIVE_ACTIVITIES.length);
          }
          return next;
        });
        setShowActivity(true);

        setTimeout(() => {
          setShowActivity(false);
          scheduleNext(false);
        }, 4000 + Math.random() * 2000);
      }, delay);
    };

    scheduleNext(true);
    return () => clearTimeout(timeout);
  }, []);

  // Track page view for TikTok Pixel and Firebase Analytics
  useEffect(() => {
    // TikTok Pixel
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('ViewContent', {
        content_type: 'product',
        content_id: 'landing-page',
        content_name: 'My House Tales Landing Page',
      });
    }
    // Firebase Analytics
    trackEvent('page_view', { page: 'landing' });
  }, []);

  const handleStartInterview = () => {
    trackEvent('cta_click', { button: 'start_interview', page: 'landing' });
    if (user) {
      router.push('/setup');
    } else {
      router.push('/login?redirect=/setup');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-white font-serif text-xl tracking-tight">My House Tales</span>
          </Link>

          <nav className="flex items-center gap-8">
            {loading ? (
              <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />
            ) : user ? (
              <Link href="/dashboard" className="text-white/70 hover:text-white text-sm tracking-wide transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-white/70 hover:text-white text-sm tracking-wide transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />

        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative w-full max-w-7xl mx-auto px-8 pt-32 pb-20"
        >
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left column - Text */}
            <div className="lg:col-span-7 space-y-8">
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-amber-500/80 text-sm tracking-[0.2em] uppercase"
              >
                Family Stories Preserved
              </motion.p>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white leading-[0.95] tracking-tight"
              >
                Capture the
                <br />
                <span className="italic text-amber-500">stories</span> that
                <br />
                matter most.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl md:text-2xl text-stone-400 max-w-lg leading-relaxed font-light"
              >
                AI-guided video interviews that help your loved ones share their life stories. Before it&apos;s too late.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col items-start gap-6 pt-4"
              >
                <button
                  onClick={handleStartInterview}
                  className="group relative px-10 py-5 bg-amber-500 text-stone-950 font-medium text-lg tracking-wide overflow-hidden transition-all hover:bg-amber-400"
                >
                  <span className="relative z-10">Start an Interview</span>
                </button>

                {/* Social proof stats */}
                <div className="flex items-center gap-6 text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">1,000+</span>
                    <span>stories told</span>
                  </div>
                  <div className="w-px h-4 bg-stone-700" />
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white font-medium">4.8</span>
                    <span>rating</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right column - Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto w-[280px] md:w-[320px] lg:w-full lg:max-w-[360px]">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/20 via-transparent to-amber-500/10 blur-3xl" />

                {/* Video container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5">
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
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border border-stone-700 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-stone-600 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Demo Section */}
      <section id="how-it-works" className="relative py-32 md:py-40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Demo video */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-stone-800/50">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                >
                  <source src="/videos/demo.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Caption */}
              <p className="mt-4 text-sm text-stone-600 tracking-wide">
                FIG. 01 — Interview in progress
              </p>
            </motion.div>

            {/* Right - Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:pl-8"
            >
              <p className="text-amber-500/80 text-sm tracking-[0.2em] uppercase mb-6">
                How it works
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.1] mb-8">
                A conversation
                <br />
                <span className="italic">to remember.</span>
              </h2>
              <p className="text-lg text-stone-400 leading-relaxed max-w-md">
                Tell us about your loved one. With your information, our AI asks thoughtful
                questions and listens patiently. No rush. No pressure. Just stories that
                your future family members can come back to watch, forever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 md:py-40 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <p className="text-amber-500/80 text-sm tracking-[0.2em] uppercase mb-6">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-white">
              Everything you need.
              <br />
              <span className="text-stone-500">Nothing you don&apos;t.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-6">
                  <span className="text-amber-500/40 text-sm font-mono tracking-wider">
                    {feature.number}
                  </span>
                  <div>
                    <h3 className="text-xl md:text-2xl text-white mb-3 font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-stone-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UGC Video Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-amber-500/80 text-sm tracking-[0.2em] uppercase mb-6">
              Real families
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white">
              Stories being told
              <br />
              <span className="italic">right now.</span>
            </h2>
          </motion.div>

          {/* Video carousel */}
          <div className="flex justify-center gap-6 md:gap-8">
            {['/videos/ugc-1.mp4', '/videos/ugc-2.mp4', '/videos/ugc-3.mp4'].map((video, index) => (
              <motion.div
                key={video}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative"
              >
                <div className="w-[200px] md:w-[260px] rounded-2xl overflow-hidden border border-stone-800/50 shadow-2xl shadow-black/30">
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
      </section>

      {/* Why now section */}
      <section className="relative py-32 md:py-40 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-amber-500/80 text-sm tracking-[0.2em] uppercase mb-6">
                Why now
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.1] mb-8">
                Before the
                <br />
                stories <span className="italic">fade.</span>
              </h2>
              <p className="text-lg text-stone-400 leading-relaxed mb-8">
                Your parents and grandparents carry decades of stories—about how they met,
                the places they grew up, the lessons they learned, the moments that shaped them.
                These stories are precious, but they&apos;re not written down anywhere.
              </p>

              <ul className="space-y-4">
                {[
                  'Works in any language they\'re comfortable with',
                  'No time pressure—they can take breaks anytime',
                  'Automatic transcription so nothing is lost',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 text-stone-400"
                  >
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Decorative quote */}
              <div className="relative p-8 md:p-12 bg-stone-900/30 border border-stone-800/50 rounded-2xl">
                <svg className="w-12 h-12 text-amber-500/20 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed mb-8">
                  &ldquo;I finally got to hear stories about my grandmother&apos;s village
                  that she never thought to share before.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center">
                    <span className="text-stone-500 font-medium">SC</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Sarah Chen</p>
                    <p className="text-sm text-stone-500">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 md:py-48">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.05] mb-8">
              Save precious
              <br />
              <span className="italic text-amber-500">stories.</span>
            </h2>
            <p className="text-xl text-stone-400 mb-12 max-w-lg mx-auto">
              It only takes a few minutes to set up. Send the link and let them share at their own pace.
            </p>

            <button
              onClick={handleStartInterview}
              className="group relative px-12 py-6 bg-amber-500 text-stone-950 font-medium text-lg tracking-wide overflow-hidden transition-all hover:bg-amber-400"
            >
              <span className="relative z-10">Start an Interview — $49.99</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-stone-500 font-serif">My House Tales</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-stone-600">
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
        </div>
      </footer>

      {/* Floating activity toast */}
      <AnimatePresence>
        {showActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 left-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-stone-800 border border-stone-700 rounded-full shadow-xl shadow-black/30">
              <span className="text-lg">{LIVE_ACTIVITIES[activityIndex].flag}</span>
              <span className="text-sm text-stone-300">
                Someone in {LIVE_ACTIVITIES[activityIndex].location} {LIVE_ACTIVITIES[activityIndex].action} {LIVE_ACTIVITIES[activityIndex].subject}
              </span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
