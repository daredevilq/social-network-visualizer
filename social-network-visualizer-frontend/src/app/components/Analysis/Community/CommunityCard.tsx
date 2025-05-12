"use client";
import React, { useState } from "react";
import { CommunitySummary } from "@/app/interface/CommunitySummary";
import CommunityMetrics from "./CommunityMetrics";
import ActivityChart from "./ActivityChart";
import PageRankBar from "./PageRankBar";

export default function CommunityCard({ data }: { data: CommunitySummary }) {
    const { communityId, memberCount, topAuthor,
        topPageRank, topHashtags, communityActivity } = data;
    const [open, setOpen] = useState(false);

    return (
        <article className="border p-4 rounded-lg shadow border-gray-700">
            <div className="flex flex-wrap justify-between gap-4 text-sm">
                <div>
                    <span className="text-lg font-semibold">Community #{communityId}</span><br/>
                    <span className="opacity-70">{memberCount} member{memberCount!==1 && "s"}</span>
                </div>
                <CommunityMetrics
                    topAuthor={topAuthor}
                    topPageRank={topPageRank}
                    topHashtags={topHashtags}
                />
            </div>
            <PageRankBar value={topPageRank} />
            <button
                onClick={() => setOpen(o => !o)}
                className="self-start text-xs mt-1 text-indigo-300 hover:text-indigo-200 transition"
            >
                {open ? "Hide details ▲" : "Show details ▼"}
            </button>
            {open &&
                <>
                    <ActivityChart data={communityActivity} />
                    <div className="flex center-2 mt-2 bottom-1 text-[10px] text-[#B7B7BA]
                       pointer-events-none select-none tracking-wide">
                        community activity in time
                    </div>
                </>}
        </article>
    );
}
