'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUp, UserSearch, MessageSquare } from 'lucide-react';
import { TweetAnalysisContainerProps } from '@/types/tweetTypes';
import TweetAnalysisContainer from './TweetAnalysisContainer';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const TweetAnalysisList = ({ userName }: TweetAnalysisContainerProps) => {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="flex flex-col w-full min-h-screen bg-[#262631] text-[#E2E2E5] p-6 lg:p-10 font-sans">
      <div className="flex flex-col h-full mx-auto w-full max-w-7xl">
        <div className="flex flex-col md:flex-row w-full mb-8 items-start md:items-center justify-between gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#9494A8] hover:text-white transition-colors cursor-pointer text-sm font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Graph
          </button>

          <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
            <div className="p-2 bg-[#7140F4]/10 rounded-lg border border-[#7140F4]/20">
              <MessageSquare className="w-6 h-6 text-[#7140F4]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center">
              {userName ? `Tweets by @${userName}` : 'Global Tweet Analysis'}
            </h1>
          </div>

          <div className="min-w-[140px] text-right flex justify-end">
            {userName && (
              <Link href={`/user-details/${userName}`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5b2ad8] rounded-lg text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 cursor-pointer">
                  <UserSearch className="w-4 h-4 flex-shrink-0" />
                  Analyze User
                </button>
              </Link>
            )}
          </div>
        </div>
        <TweetAnalysisContainer userName={userName} />

        <button
          className={`fixed bottom-8 right-8 bg-[#7140F4] hover:bg-[#5b2ad8] text-white p-3 rounded-full shadow-xl transition-all duration-300 z-50 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          onClick={scrollToTop}
        >
          <ArrowUp size={24} />
        </button>
      </div>
    </section>
  );
};

export default TweetAnalysisList;
