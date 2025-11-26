'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUp, UserSearch } from 'lucide-react';
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
    <section className="flex flex-col w-full min-h-screen bg-[#262631] text-[#FAFAFA] p-6">
      <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">
        <div className="flex w-full mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Graph
          </button>

          <h1 className="text-3xl font-bold text-center flex-grow mx-4">
            {userName ? `Tweet Analysis for @${userName}` : 'All Tweet Analysis'}
          </h1>

          <div className="min-w-32 text-right">
            {userName && (
              <Link href={`/user-details/${userName}`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md cursor-pointer">
                  <UserSearch className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                  Analyze User
                </button>
              </Link>
            )}
          </div>
        </div>

        <TweetAnalysisContainer userName={userName} />

        {showScrollTop && (
          <button
            className="fixed bottom-12 right-12 bg-[#7140F4] hover:bg-[#5c32c3] text-white p-3 rounded-full shadow-lg transition lg:block"
            onClick={scrollToTop}
          >
            <ArrowUp size={32} />
          </button>
        )}
      </div>
    </section>
  );
};

export default TweetAnalysisList;
