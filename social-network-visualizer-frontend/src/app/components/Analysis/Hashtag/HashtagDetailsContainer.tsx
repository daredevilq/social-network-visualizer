import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import HashtagProfileContainer, { HashtagProfile } from '@/app/components/Analysis/Hashtag/HashtagProfileContainer';
import { HashtagMostCommonWordsContainer } from '@/app/components/Analysis/Hashtag/HashtagMostCommonWordsContainer';
import HashtagActivityTimelineContainer from './HashtagActivityTimelineContainer';
import HashtagTopTweetsContainer from './HashtagTopTweetsContainer';
import { Hash } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationProvider';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { BannerType } from '../../Popups/Banner';
import HashtagTopAuthorsContainer from './HashtagTopAuthorsContainer';
import { HashtagDetailsDto } from '@/app/interface/HashtagData';

export interface HashtagActivity {
  [month: string]: number;
}

const CHART_BACKGROUND_COLOR = 'rgba(92, 55, 230, 0.8)';
const CHART_BORDER_COLOR = 'rgba(92, 55, 230, 1)';

export default function HashtagDetailsContainer({ hashtagName }: { hashtagName: string }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [hashtagActivity, setHashtagActivity] = useState<HashtagActivity | null>(null);
  const [hashtagProfileData, setHashtagProfileData] = useState<HashtagProfile | null>(null);
  const [topAuthorsAndTweets, setTopAuthorsAndTweets] = useState<HashtagDetailsDto | null>(null);
  const [hashtagsCommonWords, setHashtagsCommonWords] = useState<{ [word: string]: number } | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hashtagName) {
      router.push('/');
      return;
    }

    fetchData();
  }, [hashtagName, router]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const hashtagRes = await fetch(`${API_BASE_URL}/hashtag/${hashtagName}/profile`);
      if (!hashtagRes.ok) throw new Error('Failed to fetch hashtag data');
      const profileData = await hashtagRes.json();
      setHashtagProfileData(profileData);

      const topAuthorsAndTweetsRes = await fetch(`${API_BASE_URL}/hashtag/${hashtagName}/top-tweets-and-authors`);
      if (!topAuthorsAndTweetsRes.ok) throw new Error('Failed to load top authors and tweets');
      const topAuthorsAndTweets: HashtagDetailsDto = await topAuthorsAndTweetsRes.json();
      setTopAuthorsAndTweets(topAuthorsAndTweets);

      const activityRes = await fetch(`${API_BASE_URL}/hashtag/${hashtagName}/activity`);
      if (!activityRes.ok) throw new Error('Failed to load hashtag activity');
      const activity = await activityRes.json();
      console.log('Hashtag Activity:', activity);
      setHashtagActivity(activity);

      const commonWordsRes = await fetch(`${API_BASE_URL}/hashtag/${hashtagName}/most-common-words`);
      if (!commonWordsRes.ok) throw new Error('Failed to load most common words');
      const commonWords = await commonWordsRes.json();
      setHashtagsCommonWords(commonWords);
    } catch (err: any) {
      const message = err?.message || 'Unexpected error occurred while fetching hashtag data';
      showNotification(message, BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: hashtagActivity ? Object.keys(hashtagActivity) : [],
    datasets: [
      {
        label: 'Hashtag Activity',
        data: hashtagActivity ? Object.values(hashtagActivity) : [],
        backgroundColor: CHART_BACKGROUND_COLOR,
        borderColor: CHART_BORDER_COLOR,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-[#262631] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Graph
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 flex items-center text-3xl font-bold">
            <Hash className="mr-2" size={32} />
            {hashtagName}
          </h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <HashtagProfileContainer profileData={hashtagProfileData} />
            <HashtagActivityTimelineContainer hashtagActivity={hashtagActivity} chartData={chartData} />
            <HashtagMostCommonWordsContainer words={hashtagsCommonWords} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HashtagTopAuthorsContainer authors={topAuthorsAndTweets?.topAuthors} />
              <HashtagTopTweetsContainer tweets={topAuthorsAndTweets?.topTweets} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
