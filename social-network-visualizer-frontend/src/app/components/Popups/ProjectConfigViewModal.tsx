'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Settings, Hash, Activity, Tag, GitMerge, Compass, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { MetricType, ProjectConfig } from '@/types/GraphTypes';
import LoadingOverlay from '@/app/components/Loading/LoadingOverlay';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';

interface ProjectConfigViewModalProps {
  projectName: string | null;
  onClose: () => void;
}

export default function ProjectConfigViewModal({ projectName, onClose }: ProjectConfigViewModalProps) {
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
        const res = await fetch(`${API_BASE_URL}/project/${encodeURIComponent(projectName)}/config`);
        if (!res.ok) {
          throw new Error(`Failed to fetch config: ${res.status} ${res.statusText}`);
        }
        const data = (await res.json()) as ProjectConfig;
        setConfig(data);
      } catch (err: any) {
        console.error('Failed to load project config:', err);
        setError(err.message || 'Failed to load project configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [projectName]);

  const isOpen = projectName !== null;

  const scrollbarClass = `
    [scrollbar-width:thin] [scrollbar-color:#7140F4_transparent]
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#7140F4] [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-[#5a33c4]
  `;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />}

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="bg-[#262631] rounded-xl w-full max-w-3xl shadow-2xl text-white max-h-[85vh] flex flex-col border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#7140F4]/10 rounded-lg">
                <Settings className="w-6 h-6 text-[#7140F4]" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold">Advanced Metrics Configuration</Dialog.Title>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    Viewing config for: <span className="text-gray-200 font-medium">{projectName}</span>
                  </p>
                  <PopoverIcon
                    message={`Displays the project's predefined advanced metric setup — showing selected metrics, orientations, node labels, and relation types.`}
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

          <div className={`p-6 overflow-y-auto ${scrollbarClass} relative`}>
            {loading && (
              <div className="py-20">
                <LoadingOverlay />
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="p-3 bg-red-500/10 rounded-full mb-3 border border-red-500/20">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-400 font-medium">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors cursor-pointer"
                >
                  Close View
                </button>
              </div>
            )}

            {config && !loading && !error && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 pb-2">
                  <Hash className="w-4 h-4 text-[#7140F4]" />
                  <h3 className="text-md font-semibold text-gray-200">Defined Metrics</h3>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#7140F4]/20 text-[#7140F4] font-medium border border-[#7140F4]/30">
                    {config.metrics.length} active
                  </span>
                </div>

                <div className="grid gap-4">
                  {config.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-700/60 rounded-xl p-5 bg-[#30303d] hover:border-[#7140F4]/50 transition-colors duration-300 shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-gray-700/50 mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-[#7140F4]" />
                          <h4 className="text-base font-bold text-[#FAFAFA]">{metric.type}</h4>
                          {metric.type === MetricType.PAGERANK && (
                            <PopoverIcon
                              message={`The **PageRank** algorithm evaluates node importance based on incoming and outgoing relationships.`}
                              scale={1.0}
                              position="right"
                            />
                          )}
                          {metric.type === MetricType.COMMUNITY && (
                            <PopoverIcon
                              message={`The **Community Detection** algorithm identifies tightly connected groups of nodes.`}
                              scale={1.0}
                              position="right"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-700/50 border border-gray-600">
                          <Compass className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] uppercase tracking-wider text-gray-300 font-semibold">{metric.orientation}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                            <label className="text-xs text-gray-300 font-medium uppercase tracking-wide">Included Nodes</label>
                            <PopoverIcon
                              message={`Indicates which node labels were included during metric computation.`}
                              scale={0.8}
                              position={'right'}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {metric.nodeTypes.length > 0 ? (
                              metric.nodeTypes.map((type) => (
                                <span
                                  key={type}
                                  className="text-xs px-2.5 py-1 rounded-md border border-[#7140F4]/30 bg-[#7140F4]/10 text-gray-200"
                                >
                                  {type}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 italic px-2">All nodes included</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <GitMerge className="w-3.5 h-3.5 text-gray-400" />
                            <label className="text-xs text-gray-300 font-medium uppercase tracking-wide">Relation Types</label>
                            <PopoverIcon
                              message={`Shows the relationship types that were part of the analysis.`}
                              scale={0.8}
                              position={'right'}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {metric.relationTypes.length > 0 ? (
                              metric.relationTypes.map((rel) => (
                                <span
                                  key={rel}
                                  className="text-xs px-2.5 py-1 rounded-md border border-gray-600 bg-gray-700/30 text-gray-300"
                                >
                                  {rel}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 italic px-2">All relations included</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 shrink-0 flex justify-end bg-[#262631] rounded-b-xl">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#7140F4] hover:bg-[#5e2ff0] text-white font-medium transition-colors shadow-lg shadow-purple-900/20 active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
