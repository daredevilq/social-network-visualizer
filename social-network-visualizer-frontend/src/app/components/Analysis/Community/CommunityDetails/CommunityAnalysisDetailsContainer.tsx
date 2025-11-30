'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCommunitySummary } from '@/app/hooks/useCommunitySummary';
import { useCommunityAuthors } from '@/app/hooks/useCommunityAuthors';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import { TopHashtagsContainer } from '@/app/components/Analysis/User/TopHashtagsContainer';
import { useActivityHeatmap } from '@/app/hooks/useActivityHeatmap';
import { useProject } from '@/app/context/ProjectContext';
import HeatMapChartCard from '@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard';
import ActivityChartCard from '@/app/components/Analysis/Community/CommunityDetails/ActivityChartCard';
import { User2, Users } from 'lucide-react';
import { useCommunityGraphNavigation } from '@/app/hooks/useCommunityGraphNavigation';

export default function CommunityAnalysisDetailsContainer({ communityId }: { communityId: string }) {
  const id = Number(communityId);
  const { data: summary, loading: loadingSummary } = useCommunitySummary(id);
  const { data: authors, loading: loadingAuthors } = useCommunityAuthors(id);
  const { data: communityHeatMap, loading: loadingHeatMap } = useActivityHeatmap({ communityId: id });
  const { setFocusedCommunityId } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const usernamesInCommunity: string[] = authors?.map((a) => a.userName) ?? [];
  const filteredUsernames = usernamesInCommunity.filter((username) => username.toLowerCase().includes(searchTerm.toLowerCase()));
  const { openCommunityGraph } = useCommunityGraphNavigation();

  const router = useRouter();

  const loading = loadingSummary || loadingAuthors || loadingHeatMap;

  if (loading) return <LoadingOverlay />;
  if (!summary) return <p>No summary found.</p>;

  const hashtagActivities = summary.topHashtags.map((name) => ({
    name,
    frequency: 0,
  }));

  return (
    <section className="flex flex-col w-full min-h-screen bg-[#262631] text-[#FAFAFA] p-6">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 flex items-center justify-between gap-4 w-full">
          <button
            onClick={() => router.push('/community-analysis')}
            className="flex items-center gap-2 text-white hover:text-gray-300 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to overview
          </button>

          <h1 className="flex-1 text-center text-2xl md:text-3xl font-bold">Community #{communityId}</h1>

          <button
            onClick={() => {
              setFocusedCommunityId(id);
              openCommunityGraph(id);
            }}
            className="ml-auto shrink-0 text-white bg-[#7140F4] hover:bg-indigo-500 cursor-pointer px-4 py-1.5 rounded-md transition-colors duration-200"
          >
            Show community graph
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <ActivityChartCard activity={summary.communityActivity} />
          </div>

          <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Author
            </h2>
            <div className="flex items-center justify-between">
              <div
                onClick={() => router.push(`/user-details/${summary?.topAuthor}`)}
                className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm text-gray-100 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md flex-shrink-0">
                  <User2 size={18} />
                </div>

                <span className="truncate font-medium text-gray-200">{summary.topAuthor}</span>
              </div>
              <span className="text-sm text-gray-400">PageRank: {summary.topPageRank.toFixed(2)}</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <HeatMapChartCard heat={communityHeatMap ?? []} />
          </div>

          <div className="lg:col-span-2">
            <TopHashtagsContainer topHashtags={hashtagActivities} />
          </div>

          <div className="lg:col-span-2 bg-[#2A2D3D] rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-gray-600 pb-2">
              <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Community Members ({usernamesInCommunity.length})
              </h2>
              <input
                type="text"
                placeholder="Search authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-60 lg:w-80 px-4 py-2 rounded-lg bg-[#3D3D4E] text-gray-200
                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredUsernames.map((username) => (
                <div
                  key={username}
                  onClick={() => router.push(`/user-details/${username}`)}
                  className="flex items-center gap-3 bg-[#3D3D4E] hover:bg-[#4D4D5E] px-5 py-3
                   rounded-xl text-sm text-gray-100 transition-all duration-200
                   cursor-pointer hover:shadow-md hover:scale-[1.01]"
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full
                        bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md flex-shrink-0"
                  >
                    <User2 size={18} />
                  </div>

                  <span className="truncate font-medium text-gray-200">{username}</span>
                </div>
              ))}
            </div>

            {filteredUsernames.length === 0 && <p className="text-gray-400 text-center py-4">No community members found</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
