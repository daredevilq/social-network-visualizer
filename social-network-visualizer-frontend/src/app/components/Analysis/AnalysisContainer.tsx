"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { CommunitySummary } from "@/app/interface/CommunitySummary";
import CommunityCard from "@/app/components/Analysis/Community/CommunityCard";
import { useProject } from "@/app/context/ProjectContext";

const BASE_URL  = "http://localhost:8080";
const PAGE_SIZE = 10;

export default function AnalysisContainer() {
    const { loading, runWithLoading } = useProject();
    const [communities, setCommunities] = useState<CommunitySummary[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { ref: inViewRef, inView } = useInView({ rootMargin: "200px" });
    const sentinelRef = inViewRef as React.RefCallback<HTMLDivElement>;

    const fetchPage = useCallback(async (pageNo: number) => {
        await runWithLoading(async () => {
            try {
                const res  = await fetch(`${BASE_URL}/community/list-slow?page=${pageNo}&size=${PAGE_SIZE}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = (await res.json()) as CommunitySummary[];

                setCommunities(prev => {
                    const seen   = new Set(prev.map(c => c.communityId));
                    const unique = json.filter(c => !seen.has(c.communityId));
                    return [...prev, ...unique];
                });
                setHasMore(json.length === PAGE_SIZE);
                setPage(pageNo + 1);
            } catch (err: any) {
                setError(err.message ?? "Unknown error");
            }
        });
    }, [runWithLoading]);

    useEffect(() => { fetchPage(0); }, []);

    useEffect(() => {
        if (inView && hasMore && !loading) fetchPage(page);
    }, [inView]);

    return (
        <div className="flex flex-col w-full md:w-[90%] md:mx-auto ml-auto px-4 md:px-6
                    pt-[72px] md:pt-24 text-[#FAFAFA]">
            <h1 className="text-3xl mt-10 font-bold mb-6 text-center md:text-left bg-gradient-to-r text-[#FAFAFA]">
                Community analysis
            </h1>

            {error && <p className="text-center text-red-400">Failed: {error}</p>}

            <div className="flex flex-col gap-4 pb-10 pr-5 overflow-y-auto scrollbar-dark
                      max-h-[calc(100vh-240px)]">
                {communities.map((c) => (
                    <CommunityCard key={c.communityId} data={c} />
                ))}

                {hasMore && (
                    <div ref={sentinelRef} className="h-1 w-full" />
                )}
            </div>
        </div>
    );
}
