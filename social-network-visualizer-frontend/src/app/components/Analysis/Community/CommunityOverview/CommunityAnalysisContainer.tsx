"use client";

import React from "react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import { useCommunityOverview } from "@/app/hooks/useCommunityOverview";
import { useCommunityList } from "@/app/hooks/useCommunityList";
import LoadingOverlay from "@/app/components/Loading/LoadingOverlay";
import OverviewSection from "@/app/components/Analysis/Community/CommunityOverview/OverviewSection";
import HistogramChartCard from "@/app/components/Analysis/Community/CommunityOverview/HistogramChartCard";
import CommunityCard from "@/app/components/Analysis/Community/CommunityOverview/CommunityCard";

export default function CommunityAnalysisContainer() {
    const { data: overview, loading: loadOv, error: errOv } = useCommunityOverview();

    const {
        list, error: errList, loading: loadList, hasMore, fetchPage, page
    } = useCommunityList();

    const { ref, inView } = useInView({ rootMargin: "200px" });
    React.useEffect(() => { if (inView && hasMore && !loadList) fetchPage(page); },
        [inView, hasMore, loadList, page, fetchPage]);

    const router = useRouter();

    if (loadOv) return <LoadingOverlay/>;
    if (errOv) return <p className="text-center text-red-400">{errOv}</p>;
    if (!overview) return null;

    return (
        <section className="flex flex-col h-max w-full text-[#FAFAFA]">
            <div className="flex flex-col h-full pt-8 pb-8 max-w-5xl mx-auto w-full">

                <header className="relative flex items-center w-full mb-6">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 text-white hover:text-gray-300 cursor-pointer transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to Graph
                    </button>

                    <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-bold">
                        Community analysis
                    </h1>
                </header>

                <OverviewSection overview={overview}/>
                <HistogramChartCard histogram={overview.sizeHistogram}/>

                {errList && <p className="text-center text-red-400">{errList}</p>}

                <main className="flex-1 overflow-y-auto flex flex-col items-center gap-4 scrollbar-dark">
                    {list.map(c => <CommunityCard key={c.communityId} data={c} />)}
                    {hasMore && <div ref={ref} className="h-1 w-full" />}
                </main>
            </div>
        </section>
    );
}
