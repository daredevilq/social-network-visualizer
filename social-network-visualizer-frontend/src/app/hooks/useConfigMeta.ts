import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";

export type ConfigMeta = {
    orientations: string[];
    metricTypes: string[];
    relationTypes: string[];
    nodeLabels: string[];
    defaultWritePropertyByMetricType?: Record<string, string>;
};

export function useConfigMeta(lazy = false) {
    const [meta, setMeta] = useState<ConfigMeta | null>(null);
    const [loading, setLoading] = useState(!lazy);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/config/meta`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            setMeta(data);
        } catch (e: any) {
            setError(e.message || "Failed to fetch config meta");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!lazy) load().catch(() => {});
    }, [lazy]);

    return { meta, loading, error, reload: load };
}
