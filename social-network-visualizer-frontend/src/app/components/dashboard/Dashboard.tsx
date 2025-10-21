import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import { useRouter } from "next/navigation";
import { ViralTweet } from "@/types/tweetTypes";
import { HashtagActivityContainer } from "@/app/components/Analysis/User/HashtagActivityContainer";
import { ViralTweetsContainer } from "@/app/components/Analysis/User/ViralTweetsContainer";
import { ProjectStatsContainer } from "@/app/components/dashboard/ProjectStatsContainer";
import { ActivityPoint } from "@/app/interface/ActivityPoint";
import ActivityChartCard from "@/app/components/Analysis/Community/CommunityDetails/ActivityChartCard";
import { ProjectStatsChart } from "@/app/components/dashboard/ProjectStatsChart";
import { TopMentionsContainer } from "@/app/components/dashboard/TopMentionsContainer";
import { TopAuthorsContainer } from "@/app/components/dashboard/TopAuthorsContainer";
import { HashtagActivityChartContainer } from "@/app/components/dashboard/HashtagActivityChartContainer";
import HeatMapChartCard from "@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard";
import { ActivityHeatmap } from "@/app/interface/ActivityHeatmap";
import { BannerType } from "@/app/components/Popups/Banner";
import { useNotification } from "@/app/context/NotificationProvider";

interface ProjectData {
  tweetsCount: number;
  usersCount: number;
  hashtagsCount: number;
  relationsCount: number;
  communitiesCount: number;
  retweetCount: number;
}

interface HashtagActivity {
  name: string;
  frequency: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [projectActivity, setProjectActivity] = useState<ActivityPoint[]>([]);
  const [topHashtags, setTopHashtags] = useState<HashtagActivity[]>([]);
  const [viralTweets, setViralTweets] = useState<ViralTweet[]>([]);
  const [topAuthors, setTopAuthors] = useState<
    { username: string; count: number }[]
  >([]);
  const [topMentions, setTopMentions] = useState<
    { username: string; count: number }[]
  >([]);
  const [heatMap, setHeatMap] = useState<ActivityHeatmap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const userDataRes = await fetch(
        `${API_BASE_URL}/dashboard/project-stats`,
      );
      if (!userDataRes.ok) throw new Error("Failed to load project stats");
      const data = await userDataRes.json();
      setProjectData(data);

      const activityRes = await fetch(`${API_BASE_URL}/dashboard/activity`);
      if (!activityRes.ok) throw new Error("Failed to load activity");
      const activity = await activityRes.json();
      setProjectActivity(activity);

      const topHashtagsRes = await fetch(`${API_BASE_URL}/dashboard/hashtags`);
      if (!topHashtagsRes.ok) throw new Error("Failed to load hashtags");
      const topHashtagsData = await topHashtagsRes.json();
      setTopHashtags(topHashtagsData);

      const viralTweetsRes = await fetch(
        `${API_BASE_URL}/dashboard/viral-tweets`,
      );
      if (!viralTweetsRes.ok) throw new Error("Failed to load viral tweets");
      const viralTweetsData = await viralTweetsRes.json();
      setViralTweets(viralTweetsData);

      const authorsRes = await fetch(`${API_BASE_URL}/dashboard/top-authors`);
      if (!authorsRes.ok) throw new Error("Failed to load top authors");
      const authorsData = await authorsRes.json();
      setTopAuthors(authorsData);

      const mentionsRes = await fetch(`${API_BASE_URL}/dashboard/top-mentions`);
      if (!mentionsRes.ok) throw new Error("Failed to load top mentions");
      const mentionsData = await mentionsRes.json();
      setTopMentions(mentionsData);

      const heatRes = await fetch(`${API_BASE_URL}/dashboard/heat-map`);
      if (!heatRes.ok) throw new Error("Failed to load heat map");
      const heatMapData = await heatRes.json();
      setHeatMap(heatMapData);
    } catch (err: any) {
      showNotification(
        err.message || "Failed to load dashboard data",
        BannerType.ERROR,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="space-y-6">
          <div className="h-64 bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      ) : (
        <div className="w-full min-h-screen bg-[#262631] text-white p-10">
          <div className="mx-auto pl-6">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Graph
              </button>

              <button
                onClick={() => router.push("/tweet-analysis")}
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
                View all tweets
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 w-full">
              <ProjectStatsContainer projectData={projectData} />
              <ProjectStatsChart projectData={projectData} />
              <TopAuthorsContainer authors={topAuthors} />
              <TopMentionsContainer mentions={topMentions} />

              <ActivityChartCard activity={projectActivity} />
              <HashtagActivityContainer
                topHashtags={topHashtags.slice(0, 10)}
              />

              <HeatMapChartCard heat={heatMap} />
              <HashtagActivityChartContainer data={topHashtags} />

              <div className="lg:col-span-2 xl:col-span-4">
                <ViralTweetsContainer viralTweets={viralTweets} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
