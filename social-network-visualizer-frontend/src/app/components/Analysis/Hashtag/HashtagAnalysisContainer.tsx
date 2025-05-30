import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import HashtagStatsContainer from "@/app/components/Analysis/Hashtag/HashtagStatsContainer";
import HashtagActivityTimelineContainer from "./HashtagActivityTimelineContainer";
import HashtagUsersContainer from "@/app/components/Analysis/Hashtag/HashtagUserContainer";
import HashtagHeatMapContainer from "./HashtagHeatMapContainer";
import RelatedHashtagsContainer from "./RelatedHashtagsContainer";
import ViralTweetsWithHashtagContainer from "./ViralTweetsWithHashtagContainer";
import {Hash} from "lucide-react";


export default function HashtagAnalysisContainer({hashtagName}: { hashtagName: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedHashTagName, setSelectedHashTagName] = useState<string | null>(null);

    useEffect(() => {
        if (!hashtagName) {
            router.push('/');
            return;
        }

        setSelectedHashTagName(hashtagName);

        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                // const userDataRes = await fetch(`${API_BASE_URL}/hashtag/${hashtagName}`)
                // const data = await userDataRes.json()
                // setUserData(data)

            } catch (err) {
                setError('Failed to load hashtag data. Please try again later.');
                console.error('Error fetching hashtag data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData()
    }, [router, setSelectedHashTagName])

    return (
        <div className="w-full min-h-screen bg-[#262631] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors hover:cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to Graph
                    </button>

                    <h1 className="flex items-center text-3xl font-bold">
                        <Hash className="mr-2" size={32} />
                        {hashtagName}
                    </h1>

                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-[#7140F4] hover:bg-[#5c32c3] rounded-md text-sm transition-colors duration-200 shadow-md hover:cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        {/* Stats Section */}
                        <HashtagStatsContainer />

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <HashtagActivityTimelineContainer />
                            <HashtagUsersContainer />
                        </div>

                        {/* Secondary Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <HashtagHeatMapContainer />
                            <RelatedHashtagsContainer />
                        </div>

                        {/* Viral Tweets Section */}
                        <ViralTweetsWithHashtagContainer />
                    </div>
                )}
            </div>
        </div>
    );
}
