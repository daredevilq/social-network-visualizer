import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import { MetricConfig } from "@/app/interface/ConfigInterface";

export function useDefaultMetricsConfig(lazy = false) {
    const [data, setData] = useState<MetricConfig[]>([]);
    const [loading, setLoading] = useState(!lazy);
    const [error, setError] = useState<string | null>(null);

    const fetchDefaultConfig = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/config/default`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const json = (await res.json()) as MetricConfig[];
            setData(json);
        } catch (e: any) {
            setError(e?.message ?? "Failed to fetch default metrics");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!lazy) {
            fetchDefaultConfig();
        }
    }, [lazy, fetchDefaultConfig]);

    return { defaultMetrics: data, loading, error, fetchDefaultConfig };
}
