'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {useCommunitySummary} from '@/app/hooks/useCommunitySummary';
import {useCommunityAuthors} from '@/app/hooks/useCommunityAuthors';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import ActivityChart from '@/app/components/Analysis/Community/CommunityOverview/ActivityChart';
import {TopHashtagsContainer} from '@/app/components/Analysis/User/TopHashtagsContainer';
import {UsersMentionedContainer} from "@/app/components/Analysis/User/UsersMentionedContainer";
import {useActivityHeatmap} from "@/app/hooks/useActivityHeatmap";
import HeatMapChartCard from "@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard";
import ActivityChartCard from "@/app/components/Analysis/Community/CommunityDetails/ActivityChartCard";
import {useProject} from "@/app/context/ProjectContext";
import {GraphType} from "@/app/interface/GraphType";
import {setGraphUiType} from "@/app/project-state";

export default function CommunityAnalysisDetailsContainer(
    {communityId}: { communityId: string }
) {
    const id = Number(communityId);
    const {data: summary, loading: loadingSummary, error: errorSummary} = useCommunitySummary(id);
    const {data: authors, loading: loadingAuthors, error: errorAuthors} = useCommunityAuthors(id);
    const {
        data: communityHeatMap,
        loading: loadingHeatMap,
        error: errorHeatMap
    } = useActivityHeatmap({communityId: id});
    const {setFocusedCommunityId} = useProject();

    const openGraph = () => {
        setFocusedCommunityId(communityId);
        setGraphUiType(GraphType.COMMUNITY);
        router.push("/");
    };

    const router = useRouter();

    const loading = loadingSummary || loadingAuthors || loadingHeatMap;
    const error = errorSummary ?? errorAuthors ?? errorHeatMap;

    if (loading) return <LoadingOverlay/>;
    if (error) return <p className="text-red-400">Error: {error}</p>;
    if (!summary) return <p>No summary found.</p>;

    const hashtagActivities = summary.topHashtags.map(name => ({name, frequency: 0}));
    const usernamesInCommunity: string[] = authors?.map(a => a.userName) ?? [];

    return (
        <section className="flex flex-col h-max w-full text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">

                <header className="mb-6 flex items-center justify-between gap-4 w-full">
                    <button
                        onClick={() => router.push('/community-analysis')}
                        className="flex items-center gap-2 text-white hover:text-gray-300 cursor-pointer transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to overview
                    </button>

                    <h1 className="flex-1 text-center text-2xl md:text-3xl font-bold">
                        Community #{communityId}
                    </h1>

                    <button
                        onClick={async () => openGraph}
                        className="ml-auto shrink-0 text-white bg-[#7140F4] hover:bg-indigo-500 cursor-pointer px-4 py-1.5 rounded-md transition-colors duration-200"
                    >
                        Show community graph
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                        <ActivityChartCard activity={summary.communityActivity}/>
                    </div>

                    <div className="bg-[#32323F] rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-600 pb-2">
                            Top Author
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">@{summary.topAuthor}</span>
                            <span className="text-sm text-gray-400">PageRank: {summary.topPageRank.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <HeatMapChartCard heat={communityHeatMap ?? []}/>
                    </div>

                    <div className="lg:col-span-2">
                        <TopHashtagsContainer topHashtags={hashtagActivities}/>
                    </div>

                    <div className="lg:col-span-2 bg-[#32323F] rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-600 pb-2">
                            Community Members ({usernamesInCommunity.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {usernamesInCommunity.map((username, index) => (
                                <button onClick={() => router.push(`/user-details/${username}`)}>
                                    <div
                                        key={index}
                                        className="bg-[#7140F4] hover:bg-indigo-500 transition-colors cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-300  border border-gray-700"
                                    >
                                        {username}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {usernamesInCommunity.length === 0 && (
                            <p className="text-gray-400 text-center py-4">No community members found</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
