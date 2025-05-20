import {FormEvent, useEffect, useState} from 'react';
import {API_BASE_URL} from "@/app/configuration/urlConfig";
import {useRouter} from "next/navigation";
import {ViralTweet} from "@/types/tweetTypes";
import {TopHashtagsContainer} from "@/app/components/UserAnalysis/TopHashtagsContainer";
import {HashtagActivityContainer} from "@/app/components/UserAnalysis/HashtagActivityContainer";
import {ViralTweetsContainer} from "@/app/components/UserAnalysis/ViralTweetsContainer";
import {ProjectStatsContainer} from "@/app/components/dashboard/ProjectStatsContainer";
import {ActivityPoint} from "@/app/interface/ActivityPoint";
import ActivityChartCard from "@/app/components/Analysis/Community/CommunityDetails/ActivityChartCard";

interface ProjectData {
    tweetsCount: number;
    usersCount: number;
    hashtagsCount: number;
}

interface HashtagActivity {
    name: string;
    frequency: number;
}

const Dashboard = () => {
    const router = useRouter();
    const [projectData, setProjectData] = useState<ProjectData | null>(null)
    const [projectActivity, setProjectActivity] = useState<ActivityPoint[]>([]);
    const [topHashtags, setTopHashtags] = useState<HashtagActivity[]>([]);
    const [viralTweets, setViralTweets] = useState<ViralTweet[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const userDataRes = await fetch(`${API_BASE_URL}/dashboard/project-data`)
                const data = await userDataRes.json()
                setProjectData(data)

                const activityRes = await fetch(`${API_BASE_URL}/dashboard/activity`)
                const activity = await activityRes.json()
                setProjectActivity(activity)

                const topHashtagsRes = await fetch(`${API_BASE_URL}/dashboard/hashtags`)
                const topHashtagsData = await topHashtagsRes.json()
                setTopHashtags(topHashtagsData)

                const viralTweetsRes = await fetch(`${API_BASE_URL}/dashboard/viral-tweets`)
                const viralTweetsData = await viralTweetsRes.json()
                setViralTweets(viralTweetsData)
            } catch (err) {
                setError('Failed to load project data. Please try again later.');
                console.error('Error fetching project data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData()
    }, [router])

    return (
        <div className="w-full min-h-screen bg-[#262631] text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to Graph
                    </button>

                    <button
                        onClick={() => router.push('/tweet-analysis')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="17 2 12 7 7 2"></polyline>
                            <path d="M2 12h20"></path>
                            <polyline points="17 22 12 17 7 22"></polyline>
                        </svg>
                        View all tweets
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ProjectStatsContainer projectData={projectData} />
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
                        <TopHashtagsContainer topHashtags={topHashtags} />
                    </div>
                    {/*<HeatMapChartCard heat={[]} />*/}
                    <ActivityChartCard activity={projectActivity} />
                    <HashtagActivityContainer topHashtags={topHashtags}/>
                    <ViralTweetsContainer viralTweets={viralTweets}/>
                </div>


            </div>
        </div>
    );
};

export default Dashboard;
