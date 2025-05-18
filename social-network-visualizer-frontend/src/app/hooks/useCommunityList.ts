"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommunitySummary } from "@/app/interface/CommunitySummary";
import { API_BASE_URL }     from "@/app/configuration/urlConfig";
import { useProject }       from "@/app/context/ProjectContext";

const PAGE_SIZE = 10;

export function useCommunityList() {
    const { runWithLoading } = useProject();

    const [list, setList] = useState<CommunitySummary[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPage = useCallback(async (p: number) => {
        if (loading || !hasMore) return;

        setLoading(true);
        await runWithLoading(async () => {
            try {
                const res  = await fetch(`${API_BASE_URL}/community/list-slow?page=${p}&size=${PAGE_SIZE}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json = (await res.json()) as CommunitySummary[];

                setList(prev => {
                    const seen = new Set(prev.map(c => c.communityId));
                    return [...prev, ...json.filter(c => !seen.has(c.communityId))];
                });
                setHasMore(json.length === PAGE_SIZE);
                setPage(p + 1);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        });
    }, [loading, hasMore, runWithLoading]);

    useEffect(() => {
        fetchPage(0);
    }, []);

    return { list, error, loading, hasMore, page, fetchPage };
}
