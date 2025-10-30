'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { NodeType } from '@/types/GraphTypes';
import { FetchConfig } from '@/types/GraphQueryRequest';
import { BannerType } from '@/app/components/Popups/Banner';
import { useNotification } from '@/app/context/NotificationProvider';
import { DEFAULT_FETCH_CONFIG } from '@/app/utils/defaultFetchConfig';

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (config: FetchConfig) => void;
  currentConfig: FetchConfig;
  selectedNodeTypes: NodeType[];
}

export default function FetchConfigModal({ open, onClose, onApply, currentConfig, selectedNodeTypes }: Props) {
  const [localLimits, setLocalLimits] = useState<Record<NodeType, number>>(DEFAULT_FETCH_CONFIG.nodeLimits!);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && currentConfig.nodeLimits) {
      setLocalLimits({ ...currentConfig.nodeLimits });
    }
  }, [open, currentConfig]);

  const handleApply = () => {
    onApply({
      ...currentConfig,
      nodeLimits: localLimits,
    });
    showNotification('Fetch limits saved', BannerType.INFO);
    onClose();
  };

  const handleCancel = () => {
    if (currentConfig.nodeLimits) {
      setLocalLimits({ ...currentConfig.nodeLimits });
    }
    onClose();
  };

  const allNodeTypes = [NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG];

  return (
    <Dialog open={open} onClose={handleCancel} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />

      <div className="bg-[#262631] rounded-xl p-6 w-full max-w-md z-50 relative shadow-xl text-white" onClick={(e) => e.stopPropagation()}>
        <Dialog.Title className="text-2xl font-bold mb-6 text-center">Configure Fetch Limits</Dialog.Title>

        <div className="space-y-6 mb-6">
          {allNodeTypes.map((nodeType) => {
            const isEnabled = selectedNodeTypes.includes(nodeType);
            const limit = localLimits[nodeType] ?? 100;

            return (
              <div key={nodeType} className={`space-y-2 ${!isEnabled ? 'opacity-40' : ''}`}>
                <div className="flex items-center justify-between">
                  <label className={`text-base font-semibold ${!isEnabled ? 'text-gray-500' : 'text-white'}`}>{nodeType}</label>
                  <span
                    className={`text-sm font-mono px-2 py-1 rounded ${!isEnabled ? 'bg-gray-700 text-gray-500' : 'bg-[#7140F4]/20 text-[#7140F4]'}`}
                  >
                    {limit}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="500"
                  value={limit}
                  disabled={!isEnabled}
                  onChange={(e) =>
                    setLocalLimits({
                      ...localLimits,
                      [nodeType]: parseInt(e.target.value),
                    })
                  }
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${!isEnabled ? 'bg-gray-700' : 'bg-gray-600 accent-[#7140F4]'}`}
                  style={{
                    background: isEnabled
                      ? `linear-gradient(to right, #7140F4 0%, #7140F4 ${(limit / 500) * 100}%, #4b5563 ${(limit / 500) * 100}%, #4b5563 100%)`
                      : undefined,
                  }}
                />

                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span>500</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
          <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">
            Cancel
          </button>

          <button onClick={handleApply} className="px-4 py-2 rounded-md bg-[#7140F4] hover:bg-[#5b30c9] transition-colors">
            Apply
          </button>
        </div>
      </div>
    </Dialog>
  );
}
