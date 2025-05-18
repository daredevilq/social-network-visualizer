'use client';

import { useEffect, useState } from 'react';
import { CommunitySummary } from '@/app/interface/CommunitySummary';
import { API_BASE_URL } from '@/app/configuration/urlConfig';

export function useCommunitySummary(communityId: number | string) {
    const [data, setData] = useState<CommunitySummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (communityId == null) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        fetch(`${API_BASE_URL}/community/summary/${communityId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<CommunitySummary>;
            })
            .then(summary => {
                if (isMounted) setData(summary);
            })
            .catch(err => {
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [communityId]);

    return { data, loading, error };
}
