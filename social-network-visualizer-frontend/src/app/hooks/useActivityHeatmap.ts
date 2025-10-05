'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL }        from '@/app/configuration/urlConfig';
import { ActivityHeatmap }     from '@/app/interface/ActivityHeatmap';
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";

type Params =
    | { communityId: number; authorName?: never }
    | { communityId?: never; authorName: string };

export function useActivityHeatmap({ communityId, authorName }: Params) {
    const [data, setData] = useState<ActivityHeatmap[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        let alive = true;
        setLoading(true);

        const url =
            communityId !== undefined
                ? `${API_BASE_URL}/community/${communityId}/heatmap`
                : `${API_BASE_URL}/community/heatmap/${encodeURIComponent(authorName!)}`;

        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json() as Promise<ActivityHeatmap[]>;
            })
            .then((json) => alive && setData(json))
            .catch((err) => {
                if (alive) {
                    showNotification(`Failed to load heatmap: ${err.message}`, BannerType.ERROR);
                }
            })
            .finally(() => alive && setLoading(false));

        return () => {
            alive = false;
        };
    }, [communityId, authorName, showNotification]);

    return { data, loading } as const;
}
