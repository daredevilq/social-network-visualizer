'use client';

import { CommunityOverview } from '@/app/interface/CommunityOverview';
import MetricCard from './MetricCard';
import { Globe, Users, MessageSquare, Maximize2, BarChart2, Hash, PenTool, Tags, Percent } from 'lucide-react';

interface Props {
  overview: CommunityOverview;
}

export default function OverviewSection({ overview }: Props) {
  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg mb-8 w-full">
      <div className="flex items-center mb-6 border-b border-white/10 pb-4">
        <Globe className="w-5 h-5 mr-2 text-[#7140F4]" />
        <h2 className="text-xl font-bold text-white">Global Community Overview</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="no. communities" value={overview.totalCommunities} icon={Users} />
        <MetricCard label="no. tweets" value={overview.totalTweets} icon={MessageSquare} />
        <MetricCard label="avg community size" value={overview.avgSize.toFixed(2)} icon={BarChart2} />
        <MetricCard label="max community size" value={overview.maxSize} icon={Maximize2} />
        <MetricCard label="avg tweets / author" value={overview.avgTweetsPerAuthor.toFixed(2)} icon={PenTool} />
        <MetricCard label="avg hashtags / author" value={overview.avgHashtagsPerAuthor.toFixed(2)} icon={Hash} />
        <MetricCard label="no. unique hashtags" value={overview.uniqueHashtags} icon={Tags} />
        <MetricCard label="p90 size" value={overview.p90} icon={Percent} />
      </div>
    </div>
  );
}
