import { useCallback, useEffect, useState } from 'react';
import { ConfigMeta, NodeType, RelationType, MetricType, Orientation } from '@/types/GraphTypes';

export function useConfigMeta() {
  const [meta, setMeta] = useState<ConfigMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetaConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const configMeta: ConfigMeta = {
        nodeTypes: Object.values(NodeType),
        relationTypes: Object.values(RelationType),
        metricTypes: Object.values(MetricType),
        orientations: Object.values(Orientation),
      };
      setMeta(configMeta);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load config metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetaConfig();
  }, [loadMetaConfig]);

  return { meta, loading, error, loadMetaConfig };
}
