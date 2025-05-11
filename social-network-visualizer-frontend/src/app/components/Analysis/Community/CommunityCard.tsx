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
        <article className="w-full bg-[#262626] rounded-2xl p-5 md:p-6
                        flex flex-col gap-4 ring-1 ring-neutral-700/40
                        shadow-md shadow-neutral-950/40">
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
                className="self-start text-xs mt-1 text-[#A0A0FF]/80 hover:underline"
            >
                {open ? "Hide details ▲" : "Show details ▼"}
            </button>
            {open && <ActivityChart data={communityActivity} />}
        </article>
    );
}
