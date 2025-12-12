'use client';

import React, { useState } from 'react';
import { CommunitySummary } from '@/app/interface/CommunitySummary';
import ActivityChart from './ActivityChart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCommunityGraphNavigation } from '@/app/hooks/useCommunityGraphNavigation';
import { Network, Users, Activity, ChevronDown, ChevronUp, Microscope, Crown, Trophy, Hash } from 'lucide-react';

export default function CommunityCard({ data }: { data: CommunitySummary }) {
  const { communityId, memberCount, topAuthor, topPageRank, topHashtags, communityActivity } = data;
  const { openCommunityGraph } = useCommunityGraphNavigation();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <article className="w-full bg-[#2A2D3D] rounded-xl border border-white/5 shadow-lg overflow-hidden hover:border-[#7140F4]/30 transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#7140F4]/10 flex items-center justify-center text-[#7140F4] border border-[#7140F4]/20">
              <Network className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Community <span className="text-[#7140F4]">#{communityId}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {memberCount.toLocaleString()} member{memberCount !== 1 && 's'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <button
              onClick={() => openCommunityGraph(communityId)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 hover:border-[#7140F4] hover:text-[#7140F4] text-gray-300 text-sm font-medium transition-all cursor-pointer group"
            >
              <Network className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Graph View
            </button>

            <Link
              href={`/community-analysis/${communityId}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7140F4] to-[#5b2ad8] hover:to-[#4a22b2] text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Microscope className="w-4 h-4" />
              Deep Analysis
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
          <div
            onClick={() => router.push(`/user-details/${topAuthor}`)}
            className="flex flex-col gap-1 p-3 rounded-lg hover:bg-[#3D3D4E] transition-colors cursor-pointer group"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Top Author
            </span>
            <span className="text-lg font-bold text-white group-hover:text-[#7140F4] transition-colors truncate">{topAuthor}</span>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg hover:bg-[#3D3D4E] transition-colors">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              Top Hashtags
            </span>
            <div className="flex flex-wrap gap-2">
              {topHashtags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/hashtag-details/${tag}`);
                  }}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-[#2A2D3D] border border-white/10 text-gray-300 hover:text-white hover:border-[#7140F4] hover:bg-[#7140F4]/20 cursor-pointer transition-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-[#3D3D4E] transition-colors cursor-pointer">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#7140F4]" />
              PageRank Score
            </span>
            <span className="text-lg font-bold text-white">{topPageRank.toFixed(4)}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1f1f2e] border-t border-white/5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-3 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#252535] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7140F4]" />
            {open ? 'Hide activity timeline' : 'Show activity timeline'}
          </div>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {open && (
          <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
            <div className="h-48 w-full bg-[#2A2D3D] rounded-lg border border-white/5 p-4">
              <ActivityChart data={communityActivity} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
