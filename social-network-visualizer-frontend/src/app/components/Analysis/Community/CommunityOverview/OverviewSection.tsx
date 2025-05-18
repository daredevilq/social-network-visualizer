"use client";

import { CommunityOverview } from "@/app/interface/CommunityOverview";
import MetricCard from "./MetricCard";

interface Props { overview: CommunityOverview }

export default function OverviewSection({ overview }: Props) {
    return (
        <div className="bg-[#32323F] rounded-xl p-6 shadow-lg mb-8 w-full">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2">
                Global community overview
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="no. communities" value={overview.totalCommunities}/>
                <MetricCard label="no. tweets" value={overview.totalTweets}/>
                <MetricCard label="avg community size" value={overview.avgSize.toFixed(2)}/>
                <MetricCard label="max community size" value={overview.maxSize}/>
                <MetricCard label="avg tweets / author" value={overview.avgTweetsPerAuthor.toFixed(2)}/>
                <MetricCard label="avg hashtags / author" value={overview.avgHashtagsPerAuthor.toFixed(2)}/>
                <MetricCard label="no. unique hashtags" value={overview.uniqueHashtags}/>
                <MetricCard label="p90 size" value={overview.p90}/>
            </div>
        </div>
    );
}
