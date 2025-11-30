'use client';

import React, { useState } from 'react';
import { Users, Info } from 'lucide-react';
import { useProject } from '@/app/context/ProjectContext';

export default function CommunityFocusIndicator() {
  const { focusedCommunityId } = useProject();
  const [showTooltip, setShowTooltip] = useState(false);

  if (focusedCommunityId == null) {
    return null;
  }

  return (
    <div className="relative ml-4">
      {showTooltip && (
        <div className="absolute top-full left-0 mt-2 bg-[#FAFAFA] text-gray-800 text-sm rounded-lg p-3 shadow-lg w-64 border border-gray-200 z-50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-indigo-600 mb-1">Single Community Mode</p>
              <p className="text-gray-600 text-xs">
                You are viewing only Community #{focusedCommunityId}. Use the <span className="font-semibold">Reset Graph</span> button in
                the bottom-right corner to view all communities.
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-2 bg-[#FAFAFA] rounded-full shadow-sm px-3 py-1.5 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-gray-500 text-sm font-medium">#{focusedCommunityId}</span>
      </div>
    </div>
  );
}
