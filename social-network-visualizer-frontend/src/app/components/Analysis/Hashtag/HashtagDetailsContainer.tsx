'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import HashtagProfileContainer, { HashtagProfile } from '@/app/components/Analysis/Hashtag/HashtagProfileContainer';
import { HashtagMostCommonWordsContainer } from '@/app/components/Analysis/Hashtag/HashtagMostCommonWordsContainer';
import HashtagActivityTimelineContainer, { HashtagActivity } from './HashtagActivityTimelineContainer';
import HashtagTopTweetsContainer from './HashtagTopTweetsContainer';
import { Hash } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationProvider';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { BannerType } from '../../Popups/Banner';
import HashtagTopAuthorsContainer from './HashtagTopAuthorsContainer';
import { HashtagDetailsDto } from '@/app/interface/HashtagData';
import { BackToGraphIcon } from '@/app/components/icons/Icons';

interface HashtagDashboardData {
  profile: HashtagProfile | null;
  activity: HashtagActivity | null;
  topAuthorsAndTweets: HashtagDetailsDto | null;
  commonWords: { [word: string]: number } | undefined;
}

const INITIAL_STATE: HashtagDashboardData = {
  profile: null,
  activity: null,
  topAuthorsAndTweets: null,
  commonWords: undefined,
};

const CHART_BACKGROUND_COLOR = 'rgba(92, 55, 230, 0.8)';
const CHART_BORDER_COLOR = 'rgba(92, 55, 230, 1)';

export default function HashtagDetailsContainer({ hashtagName }: { hashtagName: string }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [data, setData] = useState<HashtagDashboardData>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!hashtagName) {
      router.push('/');
      return;
    }

    fetchData();
  }, [hashtagName, router]);

  const fetchData = async () => {
    setLoading(true);

    const endpointNames = ['profile', 'topAuthorsAndTweets', 'activity', 'commonWords'];

    const endpoints = {
      profile: `${API_BASE_URL}/hashtag/${hashtagName}/profile`,
      topAuthorsAndTweets: `${API_BASE_URL}/hashtag/${hashtagName}/top-tweets-and-authors`,
      activity: `${API_BASE_URL}/hashtag/${hashtagName}/activity`,
      commonWords: `${API_BASE_URL}/hashtag/${hashtagName}/most-common-words`,
    };

    try {
      const results = await Promise.allSettled([
        fetch(endpoints.profile),
        fetch(endpoints.topAuthorsAndTweets),
        fetch(endpoints.activity),
        fetch(endpoints.commonWords),
      ]);

      const responses = await Promise.all(
        results.map(async (result, index) => {
          const currentEndpointName = endpointNames[index];

          if (result.status === 'fulfilled' && result.value.ok) {
            try {
              return await result.value.json();
            } catch (e) {
              console.error(`JSON parse error for endpoint: ${currentEndpointName}`);
              return null;
            }
          }

          if (result.status === 'rejected') {
            console.error(`Fetch failed for endpoint: ${currentEndpointName}`, result.reason);
          } else if (result.status === 'fulfilled' && !result.value.ok) {
            console.error(`Fetch error status: ${result.value.status} for endpoint: ${currentEndpointName}`);
          }
          return null;
        })
      );

      if (!responses[0]) {
        throw new Error('Failed to fetch main hashtag profile data');
      }

      setData({
        profile: responses[0],
        topAuthorsAndTweets: responses[1] || null,
        activity: responses[2] || null,
        commonWords: responses[3] || undefined,
      });
    } catch (err: any) {
      const message = err?.message || 'Unexpected error occurred while fetching hashtag data';
      showNotification(message, BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: data.activity ? Object.keys(data.activity) : [],
    datasets: [
      {
        label: 'Hashtag Activity',
        data: data.activity ? Object.values(data.activity) : [],
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
            <BackToGraphIcon />
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
        ) : (
          <div className="space-y-8">
            <HashtagProfileContainer profileData={data.profile} />
            <HashtagActivityTimelineContainer hashtagActivity={data.activity} chartData={chartData} />
            <HashtagMostCommonWordsContainer words={data.commonWords} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HashtagTopAuthorsContainer authors={data.topAuthorsAndTweets?.topAuthors} />
              <HashtagTopTweetsContainer tweets={data.topAuthorsAndTweets?.topTweets} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
