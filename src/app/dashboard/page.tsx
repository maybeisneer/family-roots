'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { getInterviewsByOrganizer, logout } from '@/lib/firebase';
import { Interview } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchInterviews = async () => {
        try {
          const data = await getInterviewsByOrganizer(user.uid);
          setInterviews(data);
        } catch (error) {
          console.error('Error fetching interviews:', error);
        } finally {
          setIsFetching(false);
        }
      };
      fetchInterviews();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-900/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-serif font-bold text-amber-500">
            Family Roots
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-stone-400 hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-stone-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif">My Family Stories</h1>
            <p className="text-stone-400">Manage and track your family interview progress</p>
          </div>
          <Link href="/setup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-400 transition-colors"
            >
              + Start New Story
            </motion.button>
          </Link>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-stone-900/50 rounded-3xl animate-pulse border border-stone-800" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-24 bg-stone-900/30 rounded-3xl border border-dashed border-stone-800 space-y-4">
            <p className="text-stone-400 italic text-lg">No stories started yet.</p>
            <Link href="/setup" className="inline-block text-amber-500 hover:text-amber-400 underline">
              Create your first interview link
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const statusColors = {
    draft: 'bg-stone-500/20 text-stone-400',
    ready: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
  };

  const statusLabels = {
    draft: 'Draft',
    ready: 'Ready to Record',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:bg-stone-900 transition-all"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[interview.status]}`}>
            {statusLabels[interview.status]}
          </span>
          <span className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">
            {new Date(interview.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-serif text-white">{interview.interviewee_name}</h3>
          <p className="text-sm text-stone-400 capitalize">
            {interview.relationship} • {interview.language}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-stone-800 space-y-3">
        {interview.status === 'completed' ? (
          <Link href={`/watch/${interview.playback_link_code}`} className="block">
            <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors">
              Watch Final Video
            </button>
          </Link>
        ) : (
          <button 
            onClick={() => {
              const url = `${window.location.origin}/interview/${interview.interview_link_code}`;
              navigator.clipboard.writeText(url);
              alert('Interview link copied to clipboard!');
            }}
            className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Invite Link
          </button>
        )}
        
        {interview.status !== 'completed' && (
          <Link href={`/watch/${interview.playback_link_code}`} className="block text-center text-xs text-stone-500 hover:text-stone-300">
            Preview Playback →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

