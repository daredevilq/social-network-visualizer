'use client';

import React, { useEffect, useState } from 'react';
import { MetricConfig, MetricType, NodeType, Orientation, ProjectConfig, RelationType } from '@/types/GraphTypes';
import { useConfigMeta } from '@/app/hooks/useConfigMeta';
import { filterValidRelations, isRelationAvailable } from '@/app/utils/nodeRelationMap';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';
import { Activity, AlertCircle, Compass, GitMerge, Tag } from 'lucide-react';

interface ConfigFormProps {
  projectName: string;
  initialConfig: ProjectConfig | null;
  onChange: (config: ProjectConfig) => void;
  defaultConfig: MetricConfig[];
}

export default function ConfigForm({ initialConfig, defaultConfig, onChange }: ConfigFormProps) {
  const { meta, loading, error, loadMetaConfig } = useConfigMeta();

  const getInitialMetrics = (): MetricConfig[] => {
    if (initialConfig?.metrics) {
      return initialConfig.metrics;
    }
    return defaultConfig;
  };

  const [metrics, setMetrics] = useState<MetricConfig[]>(getInitialMetrics());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && defaultConfig.length > 0) {
      setMetrics(defaultConfig);
      setInitialized(true);
    }
  }, [defaultConfig, initialized]);

  useEffect(() => {
    if (initialConfig?.metrics) {
      setMetrics(initialConfig.metrics);
    }
  }, [initialConfig]);

  useEffect(() => {
    if (initialized) {
      const config: ProjectConfig = {
        metrics,
      };
      onChange(config);
    }
  }, [metrics, initialized]);

  const updateMetric = (idx: number, patch: Partial<MetricConfig>) => {
    setMetrics((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        const updated = { ...row, ...patch };

        if (patch.nodeTypes) {
          updated.relationTypes = filterValidRelations(updated.relationTypes, updated.nodeTypes);
        }

        return updated;
      })
    );
  };

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    const set = new Set(array);
    if (set.has(item)) {
      set.delete(item);
    } else {
      set.add(item);
    }
    return Array.from(set);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
        <div className="w-5 h-5 border-2 border-[#7140F4] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Loading configuration options…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-400 gap-2 bg-red-500/5 rounded-lg border border-red-500/20">
        <AlertCircle className="w-6 h-6" />
        <span className="text-sm">Failed to load config options.</span>
        <button
          onClick={loadMetaConfig}
          className="text-xs px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/30 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!meta) return null;

  return (
    <div className="space-y-6">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="border border-gray-700 rounded-xl p-5 space-y-5 bg-[#30303d] shadow-sm hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#7140F4]" />
              <h4 className="text-lg font-bold text-[#FAFAFA]">{metric.type}</h4>
              {metric.type === MetricType.PAGERANK && (
                <PopoverIcon message={`The **PageRank** algorithm measures the importance of nodes...`} scale={1.0} position="right" />
              )}
              {metric.type === MetricType.COMMUNITY && (
                <PopoverIcon
                  message={`The **Community Detection** algorithm identifies clusters of nodes...`}
                  scale={1.0}
                  position="right"
                />
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-[#7140F4]/10 text-[#7140F4] font-bold border border-[#7140F4]/20">
              {metric.orientation}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-300 font-semibold uppercase tracking-wide">Orientation</label>
              <PopoverIcon message={`Defines how relationship direction is treated...`} scale={0.9} position={'right'} />
            </div>
            <div className="flex gap-3">
              {meta.orientations.map((o: string) => (
                <label
                  key={o}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 group
                    ${
                      metric.orientation === o
                        ? 'border-[#7140F4] bg-[#7140F4]/20 text-white shadow-[0_0_10px_rgba(113,64,244,0.15)]'
                        : 'border-gray-600 bg-[#262631] text-gray-400 hover:border-gray-500 hover:bg-[#2c2c36]'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      metric.orientation === o ? 'border-[#7140F4]' : 'border-gray-500 group-hover:border-gray-400'
                    }`}
                  >
                    {metric.orientation === o && <div className="w-2 h-2 rounded-full bg-[#7140F4]" />}
                  </div>

                  <input
                    type="radio"
                    name={`orientation-${idx}`}
                    className="hidden"
                    checked={metric.orientation === o}
                    onChange={() => updateMetric(idx, { orientation: o as Orientation })}
                  />
                  <span className="text-xs font-bold">{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-300 font-semibold uppercase tracking-wide">Node Labels</label>
              <PopoverIcon message={`Select which node labels will be analyzed...`} scale={0.9} position={'right'} />
            </div>
            <div className="flex flex-wrap gap-2">
              {meta.nodeTypes.map((nl: string) => {
                const isDisabled = nl !== 'AUTHOR';
                const isSelected = metric.nodeTypes.includes(nl as NodeType);
                return (
                  <label
                    key={nl}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 select-none ${
                      isDisabled
                        ? 'border-gray-800 bg-[#1a1a24] text-gray-600 cursor-not-allowed opacity-60'
                        : isSelected
                          ? 'border-[#7140F4] bg-[#7140F4]/20 text-white cursor-pointer shadow-sm hover:bg-[#7140F4]/30'
                          : 'border-gray-600 bg-[#262631] text-gray-400 hover:border-gray-500 hover:text-gray-200 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => {
                        if (!isDisabled) {
                          const updated = toggleArrayItem(metric.nodeTypes, nl as NodeType);
                          if (updated.length > 0) {
                            updateMetric(idx, { nodeTypes: updated });
                          }
                        }
                      }}
                    />
                    <div
                      className={`w-3 h-3 rounded-[2px] border flex items-center justify-center ${
                        isSelected ? 'bg-[#7140F4] border-[#7140F4]' : 'border-gray-500'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{nl}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitMerge className="w-4 h-4 text-gray-400" />
              <label className="text-xs text-gray-300 font-semibold uppercase tracking-wide">Relation Types</label>
              <PopoverIcon message={`Choose which relationship types should be included...`} scale={0.9} position={'right'} />
            </div>
            <div className="flex flex-wrap gap-2">
              {meta.relationTypes.map((rt: string) => {
                const isAvailable = isRelationAvailable(rt as RelationType, metric.nodeTypes);
                const isChecked = metric.relationTypes.includes(rt as RelationType);

                return (
                  <label
                    key={rt}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 select-none ${
                      !isAvailable
                        ? 'border-gray-800 bg-[#1a1a24] text-gray-600 cursor-not-allowed opacity-60'
                        : isChecked
                          ? 'border-[#7140F4] bg-[#7140F4]/20 text-white cursor-pointer shadow-sm hover:bg-[#7140F4]/30'
                          : 'border-gray-600 bg-[#262631] text-gray-400 hover:border-gray-500 hover:text-gray-200 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      disabled={!isAvailable}
                      onChange={() => {
                        if (isAvailable) {
                          const updated = toggleArrayItem(metric.relationTypes, rt as RelationType);
                          if (updated.length > 0) {
                            updateMetric(idx, { relationTypes: updated });
                          }
                        }
                      }}
                    />
                    <div
                      className={`w-3 h-3 rounded-[2px] border flex items-center justify-center ${
                        isChecked ? 'bg-[#7140F4] border-[#7140F4]' : 'border-gray-500'
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{rt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
