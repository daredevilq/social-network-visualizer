'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL }        from '@/app/configuration/urlConfig';
import { ActivityHeatmap }     from '@/app/interface/ActivityHeatmap';

type Params =
    | { communityId: number; authorName?: never }
    | { communityId?: never; authorName: string };

export function useActivityHeatmap({ communityId, authorName }: Params) {
    const [data, setData] = useState<ActivityHeatmap[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        const url = communityId !== undefined
            ? `${API_BASE_URL}/community/${communityId}/heatmap`
            : `${API_BASE_URL}/community/heatmap/${encodeURIComponent(authorName!)}`;

        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json() as Promise<ActivityHeatmap[]>;
            })
            .then(json => alive && setData(json))
            .catch(err => alive && setError(err.message))
            .finally(() => alive && setLoading(false));

        return () => { alive = false; };
    }, [communityId, authorName]);

    return { data, loading, error } as const;
}
