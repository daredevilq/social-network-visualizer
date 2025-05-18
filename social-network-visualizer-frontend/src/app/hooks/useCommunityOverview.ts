"use client";

import {useEffect, useState} from "react";
import {CommunityOverview} from "@/app/interface/CommunityOverview";
import {API_BASE_URL} from "@/app/configuration/urlConfig";

export function useCommunityOverview() {
    const [data, setData]  = useState<CommunityOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        fetch(`${API_BASE_URL}/community/overview`)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(json => mounted && setData(json))
            .catch(e  => mounted && setError(e.message))
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    return {data, loading, error};
}
