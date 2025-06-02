"use client";

import React, { useState } from "react";
import { CommunitySummary } from "@/app/interface/CommunitySummary";
import CommunityMetrics from "./CommunityMetrics";
import ActivityChart from "./ActivityChart";
import PageRankBar from "./PageRankBar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {useProject} from "@/app/context/ProjectContext";
import {GraphType} from "@/app/interface/GraphType";
import {setGraphUiType} from "@/app/project-state";

export default function CommunityCard({ data }: { data: CommunitySummary }) {
    const {
        communityId,
        memberCount,
        topAuthor,
        topPageRank,
        topHashtags,
        communityActivity,
    } = data;

    const { setFocusedCommunityId, setSelectedGraphType } = useProject();

    const openGraph = async () => {
        setFocusedCommunityId(data.communityId.toString());
        await setGraphUiType(GraphType.COMMUNITY);
        setSelectedGraphType(GraphType.COMMUNITY);
        router.push("/");
    };

    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <article className="w-full max-w-5xl bg-[#32323F] rounded-xl p-6 shadow-lg">
            <div className="flex flex-wrap justify-between gap-6 mb-4">
                <div>
                    <h3 className="text-xl font-semibold leading-none">
                        Community&nbsp;#{communityId}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {memberCount}&nbsp;member{memberCount !== 1 && "s"}
                    </p>
                </div>

                <CommunityMetrics
                    topAuthor={topAuthor}
                    topPageRank={topPageRank}
                    topHashtags={topHashtags}
                />
            </div>

            <PageRankBar value={topPageRank} />

            <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <button
                    onClick={() => setOpen(o => !o)}
                    className="text-indigo-300 hover:text-indigo-200 transition"
                >
                    {open ? "Hide graph ▲" : "Show graph ▼"}
                </button>

                <Link
                    href={`/community-analysis/${communityId}`}
                    className="text-white px-3 py-1 bg-[#7140F4] hover:bg-indigo-500 rounded-md transition"
                >
                    Analyse
                </Link>
                <button
                    onClick={openGraph}
                    className="text-white px-3 py-1 bg-[#7140F4] hover:bg-indigo-500 rounded-md transition">
                    Show graph
                </button>
            </div>

            {open && (
                <div className="mt-6">
                    <ActivityChart data={communityActivity} />

                </div>
            )}
        </article>
    );
}
