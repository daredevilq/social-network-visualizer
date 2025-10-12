"use client";

import { Dialog } from "@headlessui/react";
import ConfigForm from "@/app/components/Popups/ConfigForm";
import type {MetricConfig, ProjectConfigDto} from "@/app/interface/ConfigInterface";
import { Settings } from "lucide-react";

interface AdvancedConfigModalProps {
    open: boolean;
    onClose: () => void;
    projectName: string;
    currentConfig: ProjectConfigDto | null;
    onChange: (config: ProjectConfigDto) => void;
    defaultMetricsConfig: MetricConfig[];
}

export default function AdvancedConfigModal({
    open,
    onClose,
    projectName,
    currentConfig,
    defaultMetricsConfig,
    onChange,
}: AdvancedConfigModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            className="fixed inset-0 z-[60] flex items-center justify-center"
        >
            {open && (
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
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
                    <Settings className="w-6 h-6 text-[#7140F4]" />
                    <Dialog.Title className="text-2xl font-bold">
                        Advanced Metrics Configuration
                    </Dialog.Title>
                </div>

                <p className="text-sm text-gray-400 mb-6">
                    Configure how each metric will be computed for your project.
                    Select node labels and relation types that should be
                    included in the analysis.
                </p>

                <ConfigForm
                    projectName={projectName}
                    initialConfig={currentConfig}
                    defaultConfig={defaultMetricsConfig}
                    onChange={onChange}
                />

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md bg-[#7140F4] hover:bg-[#5e2ff0] text-white font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
