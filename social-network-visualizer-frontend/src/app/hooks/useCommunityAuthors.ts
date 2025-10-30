'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { AuthorNode } from '@/app/interface/AuthorNode';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';

export function useCommunityAuthors(communityId: number | string) {
  const [data, setData] = useState<AuthorNode[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (communityId == null) return;

    let mounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/community/${communityId}/authors`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AuthorNode[]>;
      })
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((err) => {
        if (mounted) {
          showNotification(`Failed to load community authors: ${err.message}`, BannerType.ERROR);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [communityId, showNotification]);

  return { data, loading };
}
