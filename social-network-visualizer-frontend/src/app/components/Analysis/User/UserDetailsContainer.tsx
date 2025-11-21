'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useProject } from '@/app/context/ProjectContext';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { ViralTweet } from '@/types/tweetTypes';
import { NodeType } from '@/types/GraphTypes';
import { UsersMentionedContainer } from '@/app/components/Analysis/User/UsersMentionedContainer';
import { ViralTweetsContainer } from '@/app/components/Analysis/User/ViralTweetsContainer';
import { UserProfileContainer } from '@/app/components/Analysis/User/UserProfileContainer';
import { ActivityTimelineContainer } from '@/app/components/Analysis/User/ActivityTimelineContainer';
import { TopHashtagsContainer } from '@/app/components/Analysis/User/TopHashtagsContainer';
import { RetweetsByContainer } from '@/app/components/Analysis/User/RetweetsByContainer';
import { RetweetsOfContainer } from '@/app/components/Analysis/User/RetweetsOfContainer';
import { HashtagActivityContainer } from '@/app/components/Analysis/User/HashtagActivityContainer';
import { ActivityHeatmap } from '@/app/interface/ActivityHeatmap';
import HeatMapChartCard from '@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard';
import { MostCommonWordsContainer } from './MostCommonWordsContainer';
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

const CHART_BACKGROUND_COLOR = 'rgba(92, 55, 230, 0.8)';
const CHART_BORDER_COLOR = 'rgba(92, 55, 230, 1)';

export default function UserDetailsContainer({ username }: { username: string }) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [userMentions, setUserMentions] = useState<string[]>([]);
  const [viralTweets, setViralTweets] = useState<ViralTweet[]>([]);
  const [topHashtags, setTopHashtags] = useState<HashtagActivity[]>([]);
  const [userHeatMap, setUserHeatMap] = useState<ActivityHeatmap[]>([]);
  const [retweetedUsers, setRetweetedUsers] = useState<string[]>([]);
  const [mostCommonWords, setMostCommonWords] = useState<string[]>([]);
  const [retweetingUsers, setRetweetingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { setSelectedUserData } = useProject();
  const [animatedStats, setAnimatedStats] = useState({
    tweetsCount: 0,
    retweetsCount: 0,
    repliesCount: 0,
    quotesCount: 0,
    averageLikesCount: 0,
    averageRepliesCount: 0,
    averageRetweetsCount: 0,
  });
  const animationStarted = useRef(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (userData && !loading && !animationStarted.current) {
      animationStarted.current = true;

      const targets = {
        tweetsCount: userData.tweetsCount,
        retweetsCount: userData.retweetsCount,
        repliesCount: userData.repliesCount,
        quotesCount: userData.quotesCount,
        averageLikesCount: userData.averageLikesCount,
        averageRepliesCount: userData.averageRepliesCount,
        averageRetweetsCount: userData.averageRetweetsCount,
      };

      const duration = 1500;
      const steps = 60;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          tweetsCount: Math.round(targets.tweetsCount * progress),
          retweetsCount: Math.round(targets.retweetsCount * progress),
          repliesCount: Math.round(targets.repliesCount * progress),
          quotesCount: Math.round(targets.quotesCount * progress),
          averageLikesCount: Math.round(targets.averageLikesCount * progress * 100) / 100,
          averageRepliesCount: Math.round(targets.averageRepliesCount * progress * 100) / 100,
          averageRetweetsCount: Math.round(targets.averageRetweetsCount * progress * 100) / 100,
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats(targets);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [userData, loading]);

  useEffect(() => {
    if (!username) {
      router.push('/');
      return;
    }

    fetchData();
  }, [username, router, setSelectedUserData]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const userDataRes = await fetch(`${API_BASE_URL}/author/${username}`);
      if (!userDataRes.ok) throw new Error('Failed to fetch user data');
      const data = await userDataRes.json();
      setUserData(data);

      setSelectedUserData({
        id: data.id,
        name: data.name,
        community: data.community,
        nodeType: data.nodeType,
      });

      const activityRes = await fetch(`${API_BASE_URL}/author/activity/${username}`);
      if (!activityRes.ok) throw new Error('Failed to load user data');
      const activity = await activityRes.json();
      setUserActivity(activity);

      const mentionsRes = await fetch(`${API_BASE_URL}/author/mentions/${username}`);
      if (!mentionsRes.ok) throw new Error('Failed to load user data');
      const mentions = await mentionsRes.json();
      setUserMentions(mentions);

      const topHashtagsRes = await fetch(`${API_BASE_URL}/author/hashtags/${username}`);
      if (!topHashtagsRes.ok) throw new Error('Failed to load user data');
      const topHashtagsData = await topHashtagsRes.json();
      setTopHashtags(topHashtagsData);

      const retweetsByRes = await fetch(`${API_BASE_URL}/author/retweets-by/${username}`);
      if (!retweetsByRes.ok) throw new Error('Failed to load user data');
      const retweetsByData = await retweetsByRes.json();
      setRetweetedUsers(retweetsByData);

      const retweetsOfRes = await fetch(`${API_BASE_URL}/author/retweets-of/${username}`);
      if (!retweetsOfRes.ok) throw new Error('Failed to load user data');
      const retweetsOfData = await retweetsOfRes.json();
      setRetweetingUsers(retweetsOfData);

      const viralTweetsRes = await fetch(`${API_BASE_URL}/author/viral-tweets/${username}`);
      if (!viralTweetsRes.ok) throw new Error('Failed to load user data');
      const viralTweetsData = await viralTweetsRes.json();
      setViralTweets(viralTweetsData);

      const mostCommonWordsRes = await fetch(`${API_BASE_URL}/author/most-common-words/${username}`);
      if (!mostCommonWordsRes.ok) throw new Error('Failed to load user data');
      const mostCommonWordsData = await mostCommonWordsRes.json();
      setMostCommonWords(mostCommonWordsData);

      const userHeatMapRes = await fetch(`${API_BASE_URL}/author/heatmap/${username}`);
      if (!userHeatMapRes.ok) throw new Error('Failed to load user data');
      const userHeatMapData: ActivityHeatmap[] = (await userHeatMapRes.json()) as ActivityHeatmap[];
      setUserHeatMap(userHeatMapData);
    } catch (err: any) {
      const message = err?.message || 'Unexpected error occurred while fetching user data';
      showNotification(message, BannerType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: userActivity ? Object.keys(userActivity) : [],
    datasets: [
      {
        label: 'User Activity',
        data: userActivity ? Object.values(userActivity) : [],
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
            <UserProfileContainer userData={userData} animatedStats={animatedStats} />
            <ActivityTimelineContainer userActivity={userActivity} chartData={chartData} />
            <HeatMapChartCard heat={userHeatMap} />
            <TopHashtagsContainer topHashtags={topHashtags} />
            <UsersMentionedContainer userMentions={userMentions} message={'Users Mentioned by this User'} />
            <RetweetsByContainer retweetedUsers={retweetedUsers} />
            <RetweetsOfContainer retweetingUsers={retweetingUsers} />
            <HashtagActivityContainer topHashtags={topHashtags} />
            <MostCommonWordsContainer words={mostCommonWords} />
            <ViralTweetsContainer viralTweets={viralTweets} />
          </div>
        )}
      </div>
    </div>
  );
}
