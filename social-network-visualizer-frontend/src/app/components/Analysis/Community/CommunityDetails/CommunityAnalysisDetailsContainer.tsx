'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCommunitySummary } from '@/app/hooks/useCommunitySummary';
import { useCommunityAuthors } from '@/app/hooks/useCommunityAuthors';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import ActivityChart from '@/app/components/Analysis/Community/CommunityOverview/ActivityChart';
import { TopHashtagsContainer } from '@/app/components/UserAnalysis/TopHashtagsContainer';
import {UsersMentionedContainer} from "@/app/components/UserAnalysis/UsersMentionedContainer";
import {useActivityHeatmap} from "@/app/hooks/useActivityHeatmap";
import HeatMapChartCard from "@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard";
import ActivityChartCard from "@/app/components/Analysis/Community/CommunityDetails/ActivityChartCard";
import {useProject} from "@/app/context/ProjectContext";
import {GraphType} from "@/app/interface/GraphType";

export default function CommunityAnalysisDetailsContainer(
    { communityId }: { communityId: string }
) {
    const id = Number(communityId);
    const { data: summary, loading: loadingSummary, error: errorSummary } = useCommunitySummary(id);
    const { data: authors, loading: loadingAuthors, error: errorAuthors } = useCommunityAuthors(id);
    const {data: communityHeatMap, loading: loadingHeatMap, error: errorHeatMap} = useActivityHeatmap({communityId: id});
    const { setFocusedCommunityId, setSelectedGraphType } = useProject();

    const openGraph = () => {
        setFocusedCommunityId(communityId);
        setSelectedGraphType(GraphType.COMMUNITY);
        router.push("/");
    };

    const router = useRouter();

    const loading = loadingSummary || loadingAuthors || loadingHeatMap;
    const error = errorSummary ?? errorAuthors ?? errorHeatMap;

    if (loading) return <LoadingOverlay />;
    if (error)  return <p className="text-red-400">Error: {error}</p>;
    if (!summary) return <p>No summary found.</p>;

    const hashtagActivities = summary.topHashtags.map(name => ({ name, frequency: 0 }));
    const usernamesInCommunity : string[] = authors?.map(a => a.userName) ?? [];

    return (
        <section className="flex flex-col h-max w-full text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">

                <header className="mb-6 flex items-center justify-between gap-4 w-full">
                    <button
                        onClick={() => router.push('/community-analysis')}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to overview
                    </button>

                    <h1 className="flex-1 text-center text-2xl md:text-3xl font-bold">
                        Community #{communityId}
                    </h1>

                    <button
                        onClick={openGraph}
                        className="ml-auto shrink-0 text-white bg-[#7140F4] hover:bg-indigo-500 px-4 py-1.5 rounded-md transition-colors duration-200"
                    >
                        Show community graph
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    <ActivityChartCard activity={summary.communityActivity} />
                    <UsersMentionedContainer
                        userMentions={[summary.topAuthor]}
                        message={`User ${summary.topAuthor} has highest pagerank: ${summary.topPageRank.toFixed(2)}`}
                    />
                    <HeatMapChartCard heat={communityHeatMap ?? []}/>
                    <TopHashtagsContainer topHashtags={hashtagActivities} />

                    <UsersMentionedContainer
                        userMentions={usernamesInCommunity}
                        message="Users in community"
                    />
                </div>
            </div>
        </section>
    );
}
