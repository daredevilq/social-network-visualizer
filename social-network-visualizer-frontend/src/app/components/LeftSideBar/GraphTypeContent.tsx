'use client';

import { graphTypeItems } from '@/app/interface/GraphType';
import { useProject } from '@/app/context/ProjectContext';
import { setGraphUiType } from '@/app/project-state';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';
import React from 'react';

export default function GraphTypeContent() {
  const { selectedGraphType, setSelectedGraphType } = useProject();
  const { showNotification } = useNotification();

  return (
    <div className="relative h-full flex flex-col text-white px-4 pt-4">
      <div className="flex items-center border-b border-white pb-2 mb-4">
        <h1 className="text-2xl font-bold mr-2">Graph Types</h1>
        <PopoverIcon
          message={`Choose a graph type to control how data is shown. Standard graph displays all nodes and links.Community graph shows only community-related nodes (Authors) and their links. Gold links were included in the community-metric calculation.`}
          scale={1.6}
          position="bottom"
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
        {graphTypeItems.map(({ value, label }) => (
          <div key={value} className="py-3">
            <button
              onClick={async () => {
                await setGraphUiType(value);
                setSelectedGraphType(value);
                showNotification(`Switched to ${label}`, BannerType.INFO);
              }}
              disabled={selectedGraphType === value}
              className={`w-full text-left transition-colors ${
                selectedGraphType === value ? 'text-[#7140F4] font-semibold' : 'text-white hover:text-[#7140F4] cursor-pointer'
              }`}
            >
              {label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
