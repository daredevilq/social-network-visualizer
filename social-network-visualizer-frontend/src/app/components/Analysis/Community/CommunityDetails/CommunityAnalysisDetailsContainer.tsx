'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCommunitySummary } from '@/app/hooks/useCommunitySummary';
import { useCommunityAuthors } from '@/app/hooks/useCommunityAuthors';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import { TopHashtagsContainer } from '@/app/components/Analysis/User/TopHashtagsContainer';
import { useActivityHeatmap } from '@/app/hooks/useActivityHeatmap';
import { useProject } from '@/app/context/ProjectContext';
import HeatMapChartCard from '@/app/components/Analysis/Community/CommunityDetails/HeatMapChartCard';
import ActivityChartCard from '@/app/components/Analysis/Community/CommunityDetails/ActivityChartCard';
import { ArrowLeft, Network } from 'lucide-react';
import { useCommunityGraphNavigation } from '@/app/hooks/useCommunityGraphNavigation';
import CommunityMembersCard from './CommunityMembersCard';

export default function CommunityAnalysisDetailsContainer({ communityId }: { communityId: string }) {
  const id = Number(communityId);
  const { data: summary, loading: loadingSummary } = useCommunitySummary(id);
  const { data: authors, loading: loadingAuthors } = useCommunityAuthors(id);
  const { data: communityHeatMap, loading: loadingHeatMap } = useActivityHeatmap({ communityId: id });
  const { setFocusedCommunityId } = useProject();
  const { openCommunityGraph } = useCommunityGraphNavigation();

  const router = useRouter();

  const loading = loadingSummary || loadingAuthors || loadingHeatMap;

  if (loading) return <LoadingOverlay />;
  if (!summary) return <div className="min-h-screen bg-[#262631] text-white p-10 flex justify-center">No summary found.</div>;

  const hashtagActivities = summary.topHashtags.map((name) => ({
    name,
    frequency: 0,
  }));

  return (
    <section className="flex flex-col w-full min-h-screen bg-[#262631] text-[#E2E2E5] p-6 lg:p-10 font-sans">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <button
            onClick={() => router.push('/community-analysis')}
            className="flex items-center gap-2 text-[#9494A8] hover:text-white cursor-pointer transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to overview
          </button>

          <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
            <div className="p-2 bg-[#7140F4]/10 rounded-lg border border-[#7140F4]/20">
              <Network className="w-6 h-6 text-[#7140F4]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Community #{communityId}</h1>
          </div>

          <button
            onClick={() => {
              setFocusedCommunityId(id);
              openCommunityGraph(id);
            }}
            className="ml-auto md:ml-0 flex items-center gap-2 text-white bg-[#7140F4] hover:bg-[#5b2ad8] cursor-pointer px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Network className="w-4 h-4" />
            Show Graph
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <ActivityChartCard activity={summary.communityActivity} />
          </div>

          <div className="lg:col-span-2">
            <HeatMapChartCard heat={communityHeatMap ?? []} />
          </div>

          <div className="lg:col-span-2">
            <TopHashtagsContainer topHashtags={hashtagActivities} />
          </div>

          <div className="lg:col-span-2">
            <CommunityMembersCard topAuthor={summary.topAuthor} topPageRank={summary.topPageRank} authors={authors} />
          </div>
        </div>
      </div>
    </section>
  );
}
