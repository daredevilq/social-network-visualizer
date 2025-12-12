'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { ViralTweet } from '@/types/tweetTypes';
import { UsersMentionedContainer } from '@/app/components/Analysis/User/UsersMentionedContainer';
import { ViralTweetsContainer } from '@/app/components/Analysis/User/ViralTweetsContainer';
import { UserProfileContainer } from '@/app/components/Analysis/User/UserProfileContainer';
import ActivityTimelineContainer from '@/app/components/Analysis/User/ActivityTimelineContainer';
import { TopHashtagsContainer } from '@/app/components/Analysis/User/TopHashtagsContainer';
import { RetweetsByContainer } from '@/app/components/Analysis/User/RetweetsByContainer';
import { RetweetsOfContainer } from '@/app/components/Analysis/User/RetweetsOfContainer';
import { HashtagActivityContainer } from '@/app/components/Analysis/User/HashtagActivityContainer';
import { ActivityHeatmap } from '@/app/interface/ActivityHeatmap';
import HeatMapChartCard from '@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard';
import { UserMostCommonWordsContainer } from './UserMostCommonWordsContainer';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UserActivity {
  [month: string]: number;
}

interface HashtagActivity {
  name: string;
  frequency: number;
}

interface DashboardData {
  userData: UserData | null;
  userActivity: UserActivity | null;
  userMentions: string[];
  viralTweets: ViralTweet[];
  topHashtags: HashtagActivity[];
  userHeatMap: ActivityHeatmap[];
  retweetedUsers: string[];
  mostCommonWords: { [word: string]: number } | undefined;
  retweetingUsers: string[];
}

const INITIAL_STATE: DashboardData = {
  userData: null,
  userActivity: null,
  userMentions: [],
  viralTweets: [],
  topHashtags: [],
  userHeatMap: [],
  retweetedUsers: [],
  mostCommonWords: undefined,
  retweetingUsers: [],
};

const CHART_BACKGROUND_COLOR = 'rgba(92, 55, 230, 0.8)';
const CHART_BORDER_COLOR = 'rgba(92, 55, 230, 1)';

export default function UserDetailsContainer({ username }: { username: string }) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const apiRequests = [
      { key: 'userData', url: `${API_BASE_URL}/author/${username}` },
      { key: 'userActivity', url: `${API_BASE_URL}/author/activity/${username}` },
      { key: 'userMentions', url: `${API_BASE_URL}/author/mentions/${username}` },
      { key: 'topHashtags', url: `${API_BASE_URL}/author/hashtags/${username}` },
      { key: 'retweetedUsers', url: `${API_BASE_URL}/author/retweets-by/${username}` },
      { key: 'retweetingUsers', url: `${API_BASE_URL}/author/retweets-of/${username}` },
      { key: 'viralTweets', url: `${API_BASE_URL}/author/viral-tweets/${username}` },
      { key: 'mostCommonWords', url: `${API_BASE_URL}/author/most-common-words/${username}` },
      { key: 'userHeatMap', url: `${API_BASE_URL}/author/heatmap/${username}` },
    ];

    try {
      const results = await Promise.allSettled(apiRequests.map((req) => fetch(req.url)));

      const responses = await Promise.all(
        results.map(async (result, index) => {
          const currentEndpointName = apiRequests[index];

          if (result.status === 'fulfilled' && result.value.ok) {
            try {
              return await result.value.json();
            } catch (e) {
              console.error(`JSON parse error for index ${index}`);
              return null;
            }
          }
          if (result.status === 'rejected') {
            console.error(`Fetch failed for endpoint: ${currentEndpointName.key}`, result.reason);
          } else if (result.status === 'fulfilled' && !result.value.ok) {
            console.error(`Fetch error status: ${result.value.status} for endpoint: ${currentEndpointName.key}`);
          }
          return null;
        })
      );

      setData({
        userData: responses[0],
        userActivity: responses[1] || null,
        userMentions: responses[2] || [],
        topHashtags: responses[3] || [],
        retweetedUsers: responses[4] || [],
        retweetingUsers: responses[5] || [],
        viralTweets: responses[6] || [],
        mostCommonWords: responses[7] || undefined,
        userHeatMap: responses[8] || [],
      });
    } catch (err: any) {
      const message = err?.message || 'Unexpected error occurred while fetching user data';
      showNotification(message, BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (!username) {
      router.push('/');
      return;
    }

    fetchData();
  }, [username, router, fetchData]);

  const chartData = {
    labels: data.userActivity ? Object.keys(data.userActivity) : [],
    datasets: [
      {
        label: 'User Activity',
        data: data.userActivity ? Object.values(data.userActivity) : [],
        backgroundColor: CHART_BACKGROUND_COLOR,
        borderColor: CHART_BORDER_COLOR,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-[#262631] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Graph
          </button>

          <h1 className="text-3xl font-bold">{username}</h1>

          <button
            onClick={() => router.push(`/tweet-analysis/${username}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 2 12 7 7 2"></polyline>
              <path d="M2 12h20"></path>
              <polyline points="17 22 12 17 7 22"></polyline>
            </svg>
            View Tweets
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UserProfileContainer userData={data.userData} />
            <ActivityTimelineContainer userActivity={data.userActivity} chartData={chartData} />
            <HeatMapChartCard heat={data.userHeatMap} />
            <UserMostCommonWordsContainer words={data.mostCommonWords} />
            <TopHashtagsContainer topHashtags={data.topHashtags} />
            <UsersMentionedContainer userMentions={data.userMentions} />

            <div className="lg:col-span-2 w-full">
              <RetweetsByContainer retweetedUsers={data.retweetedUsers} />
            </div>

            <div className="lg:col-span-2 w-full">
              <RetweetsOfContainer retweetingUsers={data.retweetingUsers} />
            </div>

            <HashtagActivityContainer topHashtags={data.topHashtags} />
            <ViralTweetsContainer viralTweets={data.viralTweets} />
          </div>
        )}
      </div>
    </div>
  );
}
