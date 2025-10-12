import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import {MetricType, NodeLabel, RelationType} from "@/app/interface/ConfigInterface";

export type ConfigMeta = {
    orientations: OrientationType[];
    metricTypes: MetricType[];
    relationTypes: RelationType[];
    nodeLabels: NodeLabel[];
};

export function useConfigMeta(lazy = false) {
    const [meta, setMeta] = useState<ConfigMeta | null>(null);
    const [loading, setLoading] = useState(!lazy);
    const [error, setError] = useState<string | null>(null);

    const loadMetaConfig = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/config/meta`);
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
        if (!lazy) loadMetaConfig().catch(() => {});
    }, [lazy]);

    return { meta, loading, error, loadMetaConfig };
}
