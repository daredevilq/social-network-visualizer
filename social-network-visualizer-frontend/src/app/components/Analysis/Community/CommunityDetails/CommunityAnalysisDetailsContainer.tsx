'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCommunitySummary } from '@/app/hooks/useCommunitySummary';
import { useCommunityAuthors } from '@/app/hooks/useCommunityAuthors';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import ActivityChart from '@/app/components/Analysis/Community/CommunityOverview/ActivityChart';
import { TopHashtagsContainer } from '@/app/components/UserAnalysis/TopHashtagsContainer';
import {UsersMentionedContainer} from "@/app/components/UserAnalysis/UsersMentionedContainer";

export default function CommunityAnalysisDetailsContainer(
    { communityId }: { communityId: string }
) {
    const id = Number(communityId);
    const { data: summary, loading: loadingSummary, error: errorSummary } = useCommunitySummary(id);
    const { data: authors, loading: loadingAuthors, error: errorAuthors } = useCommunityAuthors(id);
    const router = useRouter();

    const loading = loadingSummary || loadingAuthors;
    const error = errorSummary ?? errorAuthors;

    if (loading) return <LoadingOverlay />;
    if (error)  return <p className="text-red-400">Error: {error}</p>;
    if (!summary) return <p>No summary found.</p>;

    const hashtagActivities = summary.topHashtags.map(name => ({ name, frequency: 0 }));
    const usernamesInCommunity : string[] = authors?.map(a => a.userName) ?? [];

    return (
        <section className="flex flex-col h-max w-full text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">

                <header className="relative flex items-center w-full mb-6">
                    <button
                        onClick={() => router.push('/community-analysis')}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to overview
                    </button>

                    <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-bold">
                        Community #{communityId}
                    </h1>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-[#32323F] rounded-xl p-6 shadow-lg w-full">
                        <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">
                            Community activity chart
                        </h2>
                        <ActivityChart data={summary.communityActivity}/>
                    </div>
                    <UsersMentionedContainer
                        userMentions={[summary.topAuthor]}
                        message={`User ${summary.topAuthor} has highest pagerank: ${summary.topPageRank.toFixed(2)}`}
                    />
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
