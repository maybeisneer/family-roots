'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getInterviewByCode } from '@/lib/firebase';
import type { Response, TranscriptSegment, Interview } from '@/types';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
];

interface ExtendedInterview extends Interview {
  responses: Response[];
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [interview, setInterview] = useState<ExtendedInterview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showChapters, setShowChapters] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
  const [translatedSegments, setTranslatedSegments] = useState<TranscriptSegment[] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch interview data directly from Firebase
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterviewByCode(code);
        if (!data) {
          throw new Error('Interview not found');
        }
        setInterview(data as ExtendedInterview);
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Interview not found. Please check the link and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [code]);

  // Translate segments while preserving timestamps for synced subtitles
  useEffect(() => {
    const getTranslation = async () => {
      const currentResponse = interview?.responses[currentResponseIndex];
      
      // Reset if English or no transcript
      if (selectedLanguage === 'en' || !currentResponse?.transcript) {
        setTranslatedTranscript(null);
        setTranslatedSegments(null);
        return;
      }

      // Check for pre-computed full translation (fallback)
      if (currentResponse.translations?.[selectedLanguage]) {
        setTranslatedTranscript(currentResponse.translations[selectedLanguage]);
      }

      // If we have segments, translate them while keeping timestamps
      const segments = currentResponse.transcript_segments;
      if (segments && segments.length > 0) {
        setIsTranslating(true);
        try {
          // Batch translate all segment texts
          const textsToTranslate = segments.map(s => s.text);
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              texts: textsToTranslate,
              targetLanguage: selectedLanguage,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.translatedTexts && data.translatedTexts.length === segments.length) {
              // Map translated texts back to original timestamps
              const translated: TranscriptSegment[] = segments.map((seg, i) => ({
                text: data.translatedTexts[i],
                startTime: seg.startTime,
                endTime: seg.endTime,
              }));
              setTranslatedSegments(translated);
            }
          }
        } catch (err) {
          console.error('Segment translation error:', err);
          setTranslatedSegments(null);
        } finally {
          setIsTranslating(false);
        }
      } else if (!currentResponse.translations?.[selectedLanguage]) {
        // No segments and no pre-computed translation - translate full transcript
        setIsTranslating(true);
        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: currentResponse.transcript,
              targetLanguage: selectedLanguage,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setTranslatedTranscript(data.translatedText);
          }
        } catch (err) {
          console.error('Translation error:', err);
        } finally {
          setIsTranslating(false);
        }
      }
    };

    getTranslation();
  }, [selectedLanguage, currentResponseIndex, interview]);

  // Auto-hide controls in theater mode
  useEffect(() => {
    if (!isTheaterMode) {
      setShowControls(true);
      return;
    }

    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    if (isPlaying) {
      hideControls();
    } else {
      setShowControls(true);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isTheaterMode, isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTheaterMode) {
        setIsTheaterMode(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTheaterMode, currentResponseIndex, interview]);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsVideoLoaded(true);
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    // Auto-advance to next chapter
    if (interview && currentResponseIndex < interview.responses.length - 1) {
      setCurrentResponseIndex(i => i + 1);
      setIsVideoLoaded(false);
    } else {
      setIsPlaying(false);
    }
  }, [interview, currentResponseIndex]);

  const currentResponse = interview?.responses[currentResponseIndex];
  const displayTranscript = translatedTranscript || currentResponse?.transcript || '';

  const handleSelectChapter = useCallback((index: number) => {
    setCurrentResponseIndex(index);
    setCurrentTime(0);
    setTranslatedTranscript(null);
    setTranslatedSegments(null);
    setIsVideoLoaded(false);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handlePrevious = useCallback(() => {
    if (currentResponseIndex > 0) {
      handleSelectChapter(currentResponseIndex - 1);
    }
  }, [currentResponseIndex, handleSelectChapter]);

  const handleNext = useCallback(() => {
    if (interview && currentResponseIndex < interview.responses.length - 1) {
      handleSelectChapter(currentResponseIndex + 1);
    }
  }, [interview, currentResponseIndex, handleSelectChapter]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = useCallback(() => {
    if (isTheaterMode) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
      }
    }
  }, [isTheaterMode, isPlaying]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 mx-auto"
          >
            <svg className="w-full h-full text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
          <p className="text-stone-400 font-light tracking-wide">Loading story...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-white">{error || 'Something went wrong'}</h1>
          <button
            onClick={() => router.push('/')}
            className="text-amber-500 hover:text-amber-400 font-light"
          >
            ← Return home
          </button>
        </motion.div>
      </div>
    );
  }

  // No responses yet
  if (!interview.responses || interview.responses.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto"
          >
            <svg className="w-full h-full text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-light text-white">Interview in progress</h1>
          <p className="text-stone-500 font-light">
            {interview.interviewee_name}&apos;s story is being recorded. Check back soon.
          </p>
        </motion.div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`min-h-screen bg-black transition-all duration-500 ${isTheaterMode ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Cinematic header */}
      <AnimatePresence>
        {(!isTheaterMode || showControls) && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="font-light text-stone-300 tracking-wide hidden sm:block">Family Roots</span>
              </Link>

              <div className="flex items-center gap-4">
                {/* Language selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                  >
                    <span className="text-lg">{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
                    <span className="text-sm text-stone-300 hidden sm:block">
                      {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                    </span>
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showLanguageMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-2 max-h-80 overflow-y-auto">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLanguage(lang.code);
                                setShowLanguageMenu(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                                selectedLanguage === lang.code
                                  ? 'bg-amber-500/20 text-amber-500'
                                  : 'hover:bg-white/5 text-stone-300'
                              }`}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span className="text-sm">{lang.name}</span>
                              {selectedLanguage === lang.code && (
                                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theater mode toggle */}
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className={`p-2 rounded-full transition-colors ${
                    isTheaterMode ? 'bg-amber-500 text-white' : 'bg-white/5 text-stone-400 hover:bg-white/10'
                  }`}
                  title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isTheaterMode ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={`transition-all duration-500 ${isTheaterMode ? 'pt-0' : 'pt-20'}`}>
        <div className={`mx-auto transition-all duration-500 ${
          isTheaterMode ? 'max-w-none' : 'max-w-7xl px-4'
        }`}>
          <div className={`grid gap-6 transition-all duration-500 ${
            isTheaterMode || !showChapters ? 'grid-cols-1' : 'lg:grid-cols-[1fr_300px]'
          }`}>
            {/* Video section */}
            <div className={`relative ${isTheaterMode ? 'h-screen' : ''}`}>
              {/* Letterbox bars in theater mode */}
              {isTheaterMode && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-[10%] bg-black z-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black z-10" />
                </>
              )}

              {/* Video container */}
              <div className={`relative ${
                isTheaterMode 
                  ? 'h-full flex items-center justify-center bg-black' 
                  : 'bg-stone-900/50 rounded-2xl overflow-hidden border border-white/5'
              }`}>
                {/* ACTUAL VIDEO PLAYER */}
                <div className={`relative ${isTheaterMode ? 'w-full h-[80%]' : 'aspect-video'} bg-black flex items-center justify-center overflow-hidden`}>
                  {currentResponse?.video_url ? (
                    <video
                      ref={videoRef}
                      key={currentResponse.video_url}
                      src={currentResponse.video_url}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleVideoEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      playsInline
                    />
                  ) : (
                    // Cinematic fallback - focus on the story itself
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-black flex items-center justify-center">
                      {/* Ambient background glow */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
                      </div>
                      
                      {/* Story icon */}
                      <div className="relative text-center space-y-6 px-8">
                        <motion.div 
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full flex items-center justify-center border border-amber-500/20"
                        >
                          <svg className="w-10 h-10 text-amber-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </motion.div>
                        <p className="text-stone-500 text-sm tracking-wide">Video processing...</p>
                      </div>
                    </div>
                  )}

                  {/* Play/Pause overlay */}
                  {currentResponse?.video_url && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={togglePlay}
                    >
                      <AnimatePresence>
                        {!isPlaying && isVideoLoaded && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-24 h-24 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                          >
                            <svg className="w-12 h-12 text-amber-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </motion.button>
                        )}
                      </AnimatePresence>
                      
                      {!isVideoLoaded && currentResponse?.video_url && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
                        />
                      )}
                    </div>
                  )}

                  {/* Film grain overlay */}
                  <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
                  </div>
                </div>

                {/* Cinematic subtitle caption overlay - shows one phrase at a time */}
                <AnimatePresence mode="wait">
                  {(() => {
                    // Use translated segments if available, otherwise original
                    const segments = translatedSegments || currentResponse?.transcript_segments || [];
                    const activeSegment = segments.find(
                      s => currentTime >= s.startTime && currentTime < s.endTime
                    );
                    
                    if (isTranslating) {
                      return (
                        <motion.div
                          key="translating"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute left-0 right-0 z-20 pointer-events-none ${
                            isTheaterMode ? 'bottom-[12%]' : 'bottom-16'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-3 text-stone-400">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
                            />
                            <span className="text-sm">Translating...</span>
                          </div>
                        </motion.div>
                      );
                    }
                    
                    if (activeSegment) {
                      return (
                        <motion.div
                          key={activeSegment.startTime}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className={`absolute left-0 right-0 z-20 pointer-events-none ${
                            isTheaterMode ? 'bottom-[12%]' : 'bottom-16'
                          }`}
                        >
                          <div className={`mx-auto px-6 text-center ${isTheaterMode ? 'max-w-5xl' : 'max-w-3xl'}`}>
                            <p 
                              className={`inline font-serif font-medium leading-relaxed ${
                                isTheaterMode ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
                              }`}
                              style={{
                                color: '#FBBF24', // Amber-400 to match app theme
                                textShadow: `
                                  -1px -1px 0 #000,
                                   1px -1px 0 #000,
                                  -1px  1px 0 #000,
                                   1px  1px 0 #000,
                                   0 2px 8px rgba(0,0,0,0.9)
                                `,
                              }}
                            >
                              {activeSegment.text}
                            </p>
                          </div>
                        </motion.div>
                      );
                    }
                    
                    // No active segment and no segments at all - show full transcript fallback
                    if (!segments.length && displayTranscript && isPlaying) {
                      return (
                        <motion.div
                          key="fallback"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute left-0 right-0 z-20 pointer-events-none ${
                            isTheaterMode ? 'bottom-[12%]' : 'bottom-16'
                          }`}
                        >
                          <div className={`mx-auto px-6 text-center ${isTheaterMode ? 'max-w-5xl' : 'max-w-3xl'}`}>
                            <p 
                              className={`inline font-serif font-medium leading-relaxed line-clamp-3 ${
                                isTheaterMode ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
                              }`}
                              style={{
                                color: '#FBBF24',
                                textShadow: `
                                  -1px -1px 0 #000,
                                   1px -1px 0 #000,
                                  -1px  1px 0 #000,
                                   1px  1px 0 #000,
                                   0 2px 8px rgba(0,0,0,0.9)
                                `,
                              }}
                            >
                              {displayTranscript}
                            </p>
                          </div>
                        </motion.div>
                      );
                    }
                    
                    return null;
                  })()}
                </AnimatePresence>

                {/* Progress bar */}
                <div className={`absolute left-0 right-0 ${isTheaterMode ? 'bottom-[8%]' : 'bottom-0'} z-20`}>
                  <div className="mx-auto px-4 max-w-4xl">
                    <div 
                      className="h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percent = x / rect.width;
                        handleSeek(percent * duration);
                      }}
                    >
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full group-hover:from-amber-400 group-hover:to-orange-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-stone-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question display */}
              {!isTheaterMode && currentResponse && (
                <motion.div
                  key={currentResponseIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center"
                >
                  <p className="text-amber-500/60 text-sm tracking-widest uppercase mb-2">
                    Chapter {currentResponseIndex + 1} of {interview.responses.length}
                  </p>
                  <h2 className="text-2xl md:text-3xl text-white font-serif font-light">
                    &ldquo;{currentResponse.question_text}&rdquo;
                  </h2>
                </motion.div>
              )}


              {/* Chapter navigation */}
              <AnimatePresence>
                {(!isTheaterMode || showControls) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center justify-center gap-4 mt-6 ${isTheaterMode ? 'absolute bottom-[4%] left-0 right-0 z-30' : ''}`}
                  >
                    <button
                      onClick={handlePrevious}
                      disabled={currentResponseIndex === 0}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-white/10"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Progress dots */}
                    <div className="flex items-center gap-2">
                      {interview.responses.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectChapter(i)}
                          className={`transition-all duration-300 rounded-full ${
                            i === currentResponseIndex
                              ? 'w-8 h-2 bg-amber-500'
                              : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={currentResponseIndex === interview.responses.length - 1}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-white/10"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chapter list sidebar */}
            <AnimatePresence>
              {!isTheaterMode && showChapters && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hidden lg:block"
                >
                  <div className="sticky top-24 bg-stone-900/30 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">Chapters</h3>
                        <button
                          onClick={() => setShowChapters(false)}
                          className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {interview.responses.map((response, index) => (
                        <button
                          key={response.id}
                          onClick={() => handleSelectChapter(index)}
                          className={`w-full p-4 text-left border-b border-white/5 last:border-0 transition-colors ${
                            index === currentResponseIndex
                              ? 'bg-amber-500/10'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              index === currentResponseIndex
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/10 text-stone-400'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm line-clamp-2 ${
                                index === currentResponseIndex ? 'text-white' : 'text-stone-400'
                              }`}>
                                {response.question_text}
                              </p>
                              <p className="text-xs text-stone-600 mt-1">
                                {formatTime(response.duration_seconds || 0)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Share footer */}
      {!isTheaterMode && (
        <footer className="max-w-7xl mx-auto px-4 py-12 mt-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-light text-white mb-2">Share this story with family</h3>
                <p className="text-stone-500 font-light">
                  Preserve and share {interview.interviewee_name}&apos;s memories with loved ones
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Story
              </button>
            </div>
          </motion.div>

          {/* Viral CTA - Create your own */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 rounded-3xl"
          >
            <div className="text-center space-y-4">
              <div className="text-4xl">🎥</div>
              <h3 className="text-2xl font-serif text-white">
                Inspired? Preserve your own family&apos;s story
              </h3>
              <p className="text-stone-400 max-w-lg mx-auto">
                Every family has stories worth saving. Start capturing your loved one&apos;s memories today—before they&apos;re lost to time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/setup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
                  >
                    Start Your Interview
                  </motion.button>
                </Link>
                <Link href="/">
                  <button className="px-8 py-4 border border-stone-700 text-stone-300 rounded-xl font-medium hover:border-stone-600 hover:text-white transition-colors">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </footer>
      )}

      {/* Keyboard hints in theater mode */}
      {isTheaterMode && showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 left-4 text-xs text-stone-600 space-y-1 z-50"
        >
          <p>Press <kbd className="px-1 py-0.5 bg-white/5 rounded">ESC</kbd> to exit theater</p>
          <p>Press <kbd className="px-1 py-0.5 bg-white/5 rounded">Space</kbd> to play/pause</p>
          <p>Use <kbd className="px-1 py-0.5 bg-white/5 rounded">←</kbd> <kbd className="px-1 py-0.5 bg-white/5 rounded">→</kbd> to navigate</p>
        </motion.div>
      )}
    </div>
  );
}
