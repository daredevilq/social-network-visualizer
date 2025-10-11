"use client";

import React, { useEffect, useState } from "react";
import type {
    ProjectConfigDto,
    MetricConfig,
    Orientation,
    RelationType,
    NodeLabel,
} from "@/app/interface/ConfigInterface";
import { useConfigMeta } from "@/app/hooks/useConfigMeta";

interface ConfigFormProps {
    projectName: string;
    initialConfig: ProjectConfigDto | null;
    onChange: (config: ProjectConfigDto) => void;
}

export default function ConfigForm({
    projectName,
    initialConfig,
    onChange,
}: ConfigFormProps) {
    const { meta, loading, error, reload } = useConfigMeta();

    // init config
    const getInitialMetrics = (): MetricConfig[] => {
        if (initialConfig?.metrics) {
            return initialConfig.metrics;
        }
        return [
            {
                type: "PAGERANK",
                orientation: "NATURAL",
                nodeLabels: ["AUTHOR"],
                relationTypes: ["MENTIONS"],
            },
            {
                type: "COMMUNITY",
                orientation: "UNDIRECTED",
                nodeLabels: ["AUTHOR"],
                relationTypes: ["MENTIONS"],
            },
            {
                type: "DEGREE",
                orientation: "NATURAL",
                nodeLabels: ["AUTHOR"],
                relationTypes: ["MENTIONS"],
            },
        ];
    };

    const [metrics, setMetrics] = useState<MetricConfig[]>(getInitialMetrics());

    useEffect(() => {
        if (initialConfig?.metrics) {
            setMetrics(initialConfig.metrics);
        }
    }, [initialConfig]);

    useEffect(() => {
        const config: ProjectConfigDto = {
            projectName,
            createdAt: new Date().toISOString(),
            metrics,
        };
        onChange(config)
    }, [projectName, metrics]);

    const updateMetric = (idx: number, patch: Partial<MetricConfig>) => {
        setMetrics((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
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
            <div className="text-sm text-gray-400 py-2">
                Loading configuration options…
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-400 py-2">
                Failed to load config options.{" "}
                <button
                    onClick={reload}
                    className="underline hover:text-red-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!meta) return null;

    return (
        <div className="space-y-4">
            {metrics.map((metric, idx) => (
                <div
                    key={idx}
                    className="border border-gray-600 rounded-lg p-4 space-y-3 bg-[#30303d]"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                        <h4 className="text-base font-semibold text-white">
                            {metric.type}
                        </h4>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                            {metric.orientation}
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                            Orientation
                        </label>
                        <div className="flex gap-2">
                            {meta.orientations.map((o) => (
                                <label
                                    key={o}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all ${
                                        metric.orientation === o
                                            ? "border-[#7140F4] bg-[#7140F4]/20 text-white"
                                            : "border-gray-600 bg-[#262631] text-gray-400 hover:border-gray-500"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`orientation-${idx}`}
                                        className="accent-[#7140F4]"
                                        checked={metric.orientation === o}
                                        onChange={() =>
                                            updateMetric(idx, {
                                                orientation: o as Orientation,
                                            })
                                        }
                                    />
                                    <span className="text-xs font-medium">
                                        {o}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                            Node Labels
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {meta.nodeLabels.map((nl) => {
                                const isDisabled = nl !== "AUTHOR";
                                return (
                                    <label
                                        key={nl}
                                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-all ${
                                            isDisabled
                                                ? "border-gray-700 bg-[#1a1a24] text-gray-600 cursor-not-allowed opacity-50"
                                                : metric.nodeLabels.includes(nl)
                                                ? "border-[#7140F4] bg-[#7140F4]/20 text-white cursor-pointer"
                                                : "border-gray-600 bg-[#262631] text-gray-400 hover:border-gray-500 cursor-pointer"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="accent-[#7140F4] cursor-pointer"
                                            checked={metric.nodeLabels.includes(
                                                nl
                                            )}
                                            disabled={isDisabled}
                                            onChange={() => {
                                                if (!isDisabled) {
                                                    const updated =
                                                        toggleArrayItem(
                                                            metric.nodeLabels,
                                                            nl
                                                        );
                                                    if (updated.length > 0) {
                                                        updateMetric(idx, {
                                                            nodeLabels:
                                                                updated as NodeLabel[],
                                                        });
                                                    }
                                                }
                                            }}
                                        />
                                        <span>{nl}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-300 mb-1.5 font-medium">
                            Relation Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {meta.relationTypes.map((rt) => (
                                <label
                                    key={rt}
                                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border cursor-pointer transition-all ${
                                        metric.relationTypes.includes(rt)
                                            ? "border-[#7140F4] bg-[#7140F4]/20 text-white"
                                            : "border-gray-600 bg-[#262631] text-gray-400 hover:border-gray-500"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="accent-[#7140F4] cursor-pointer"
                                        checked={metric.relationTypes.includes(
                                            rt
                                        )}
                                        onChange={() => {
                                            const updated = toggleArrayItem(
                                                metric.relationTypes,
                                                rt
                                            );
                                            if (updated.length > 0) {
                                                updateMetric(idx, {
                                                    relationTypes:
                                                        updated as RelationType[],
                                                });
                                            }
                                        }}
                                    />
                                    <span>{rt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
