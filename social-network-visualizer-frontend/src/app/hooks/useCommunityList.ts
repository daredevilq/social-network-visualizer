"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommunitySummary } from "@/app/interface/CommunitySummary";
import { API_BASE_URL }     from "@/app/configuration/urlConfig";
import { useProject }       from "@/app/context/ProjectContext";
import { BannerType } from "../components/Popups/Banner";
import {useNotification} from "@/app/context/NotificationProvider";

const PAGE_SIZE = 10;

export function useCommunityList() {
    const { runWithLoading } = useProject();
    const { showNotification } = useNotification();

    const [list, setList] = useState<CommunitySummary[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchPage = useCallback(
        async (p: number) => {
            if (loading || !hasMore) return;

            setLoading(true);

            await runWithLoading(async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/community/list-slow?page=${p}&size=${PAGE_SIZE}`);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const json = (await res.json()) as CommunitySummary[];

                    setList((prev) => {
                        const seen = new Set(prev.map((c) => c.communityId));
                        return [...prev, ...json.filter((c) => !seen.has(c.communityId))];
                    });
                    setHasMore(json.length === PAGE_SIZE);
                    setPage(p + 1);
                } catch (e: any) {
                    showNotification(e.message || "Failed to load communities", BannerType.ERROR);
                } finally {
                    setLoading(false);
                }
            });
        },
        [loading, hasMore, runWithLoading, showNotification]
    );

    useEffect(() => {
        fetchPage(0);
    }, []);

    return { list, loading, hasMore, page, fetchPage };
}
