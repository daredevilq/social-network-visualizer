'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { AuthorNode } from '@/app/interface/AuthorNode';

export function useCommunityAuthors(communityId: number | string) {
    const [data, setData] = useState<AuthorNode[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (communityId == null) return;
        let mounted = true;
        setLoading(true);
        setError(null);

        fetch(`${API_BASE_URL}/community/${communityId}/authors`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<AuthorNode[]>;
            })
            .then(json => {
                if (mounted) setData(json);
            })
            .catch(err => {
                if (mounted) setError(err.message);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [communityId]);

    return { data, loading, error };
}
