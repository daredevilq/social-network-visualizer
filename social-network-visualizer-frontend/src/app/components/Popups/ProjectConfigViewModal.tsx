"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Settings, Hash } from "lucide-react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import type { ProjectConfig } from "@/types/GraphTypes";
import LoadingOverlay from "@/app/components/Loading/LoadingOverlay";

interface ProjectConfigViewModalProps {
    projectName: string | null;
    onClose: () => void;
}

export default function ProjectConfigViewModal({
    projectName,
    onClose,
}: ProjectConfigViewModalProps) {
    const [config, setConfig] = useState<ProjectConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectName) {
            setConfig(null);
            return;
        }

        const fetchConfig = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/project/${encodeURIComponent(
                        projectName
                    )}/config`
                );
                if (!res.ok) {
                    throw new Error(
                        `Failed to fetch config: ${res.status} ${res.statusText}`
                    );
                }
                const data = (await res.json()) as ProjectConfig;
                setConfig(data);
            } catch (err: any) {
                console.error("Failed to load project config:", err);
                setError(err.message || "Failed to load project configuration");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [projectName]);

    const isOpen = projectName !== null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60"
                    aria-hidden="true"
                    onClick={onClose}
                />
            )}

            <div
                className="bg-[#262631] rounded-xl p-6 w-full max-w-3xl z-50 relative shadow-2xl text-white max-h-[85vh] overflow-y-auto scrollbar-dark"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-[#7140F4]" />
                        <Dialog.Title className="text-2xl font-bold">
                            Project Configuration
                        </Dialog.Title>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading && <LoadingOverlay />}

                {error && !loading && (
                    <div className="text-center py-8">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white"
                        >
                            Close
                        </button>
                    </div>
                )}

                {config && !loading && !error && (
                    <div className="space-y-6">
                        <div className="bg-[#30303d] rounded-lg p-4 border border-gray-700">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block font-medium">
                                    Project Name
                                </label>
                                <p className="text-white font-semibold text-lg">
                                    {projectName}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Hash className="w-5 h-5 text-[#7140F4]" />
                                <h3 className="text-lg font-semibold">
                                    Metrics Configuration
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#7140F4]/20 text-[#7140F4]">
                                    {config.metrics.length} metric
                                    {config.metrics.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {config.metrics.map((metric, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-gray-600 rounded-lg p-4 space-y-3 bg-[#30303d]"
                                    >
                                        <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                                            <h4 className="text-base font-semibold text-white">
                                                {metric.type}
                                            </h4>
                                            <span className="text-xs px-2.5 py-1 rounded bg-gray-700 text-gray-300 font-medium">
                                                {metric.orientation}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2 font-medium">
                                                Node Labels
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {metric.nodeLabels.map(
                                                    (label) => (
                                                        <span
                                                            key={label}
                                                            className="text-xs px-2.5 py-1.5 rounded border border-[#7140F4] bg-[#7140F4]/20 text-white"
                                                        >
                                                            {label}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2 font-medium">
                                                Relation Types
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {metric.relationTypes.map(
                                                    (rel) => (
                                                        <span
                                                            key={rel}
                                                            className="text-xs px-2.5 py-1.5 rounded border border-[#7140F4] bg-[#7140F4]/20 text-white"
                                                        >
                                                            {rel}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-700">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-md bg-[#7140F4] hover:bg-[#5e2ff0] text-white font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
}
