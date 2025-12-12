'use client';

import { Dialog } from '@headlessui/react';
import ConfigForm from '@/app/components/Popups/ConfigForm';
import type { MetricConfig, ProjectConfig } from '@/types/GraphTypes';
import { Settings, X } from 'lucide-react';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';
import React from 'react';

interface AdvancedConfigModalProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  currentConfig: ProjectConfig | null;
  onChange: (config: ProjectConfig) => void;
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
  const scrollbarClass = `
    [scrollbar-width:thin] [scrollbar-color:#7140F4_transparent]
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#7140F4] [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-[#5a33c4]
  `;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />}

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="bg-[#262631] rounded-xl w-full max-w-3xl shadow-2xl text-white max-h-[85vh] flex flex-col border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#7140F4]/10 rounded-lg">
                <Settings className="w-6 h-6 text-[#7140F4]" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold">Advanced Metrics Configuration</Dialog.Title>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    Setup for: <span className="text-gray-200 font-medium">{projectName}</span>
                  </p>
                  <PopoverIcon
                    message={`Configure advanced metrics: choose metrics, orientations, node labels, and relation types for your project.`}
                    scale={1.2}
                    position="bottom"
                  />
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer">
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className={`p-6 overflow-y-auto ${scrollbarClass}`}>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed bg-[#30303d] p-3 rounded-lg border border-gray-700/50">
              Configure how each metric will be computed. Select node labels and relation types to include.
              <br />
              <span className="text-xs text-red-400 font-bold mt-2 block flex items-center gap-1">
                ⚠️ Once the project is created, these settings cannot be changed!
              </span>
            </p>

            <ConfigForm projectName={projectName} initialConfig={currentConfig} defaultConfig={defaultMetricsConfig} onChange={onChange} />
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-gray-700 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#7140F4] hover:bg-[#5e2ff0] text-white font-medium transition-colors shadow-lg shadow-purple-900/20 active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
