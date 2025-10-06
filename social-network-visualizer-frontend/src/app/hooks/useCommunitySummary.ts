'use client';

import { useEffect, useState } from 'react';
import { CommunitySummary } from '@/app/interface/CommunitySummary';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";

export function useCommunitySummary(communityId: number | string) {
    const [data, setData] = useState<CommunitySummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { showNotification } = useNotification()

    useEffect(() => {
        if (communityId == null) return;

        let isMounted = true;
        setLoading(true);

        fetch(`${API_BASE_URL}/community/summary/${communityId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<CommunitySummary>;
            })
            .then(summary => {
                if (isMounted) setData(summary);
            })
            .catch(err => {
                if (isMounted) {
                    showNotification(`Failed to load community summary: ${err.message}`, BannerType.ERROR);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [communityId, showNotification]);

    return { data, loading };
}
