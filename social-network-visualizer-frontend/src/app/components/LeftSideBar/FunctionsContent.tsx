'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';
import ShortestPathModal from '@/app/components/Popups/ShortestPathModal';
import { GraphNode } from '@/types/GraphTypes';
import { useGraph } from '@/app/context/GraphContext';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { BannerType } from '@/app/components/Popups/Banner';
import { useProject } from '@/app/context/ProjectContext';
import { useNotification } from '@/app/context/NotificationProvider';

export default function FunctionsContent() {
  const [isShortestPathModalOpen, setIsShortestPathModalOpen] = useState(false);
  const { runWithLoading, selectedNodeTypes, selectedRelationTypes } = useProject();
  const { setShortestPath, setGraphBridges } = useGraph();
  const router = useRouter();
  const { runWithUnsavedCheck } = useWorkspace();
  const { showNotification } = useNotification();

  const handleSearchPath = async (source: GraphNode, target: GraphNode) => {
    if (!source || !target) {
      setShortestPath([]);
      return;
    }

    runWithLoading(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/graph/shortest-path`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source,
            target,
            nodeTypes: selectedNodeTypes,
            relationTypes: selectedRelationTypes,
          }),
        });

        if (!res.ok) {
          showNotification('Failed to fetch shortest path.', BannerType.ERROR);
          return;
        }

        const data = await res.json();

        if (!data || data.length === 0) {
          setShortestPath([]);
          showNotification('No path found.', BannerType.INFO);
          return;
        }

        setShortestPath(data);
        showNotification('Shortest path found successfully.', BannerType.SUCCESS);
      } catch (err) {
        console.error(err);
        showNotification('Unexpected error while fetching shortest path.', BannerType.ERROR);
      }
    });
  };

  const handleSearchBridges = async () => {
    runWithLoading(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/graph/bridges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nodeTypes: selectedNodeTypes,
            relationTypes: selectedRelationTypes,
          }),
        });

        if (!res.ok) {
          showNotification('Failed to fetch graph bridges.', BannerType.ERROR);
          return;
        }

        const data = await res.json();

        if (!data || data.length === 0) {
          setGraphBridges([]);
          showNotification('No bridges found.', BannerType.INFO);
          return;
        }

        setGraphBridges(data);
        showNotification('Graph bridges found successfully.', BannerType.SUCCESS);
      } catch (err) {
        console.error(err);
        showNotification('Unexpected error while fetching bridges.', BannerType.ERROR);
      }
    });
  };

  return (
    <div className="relative h-full flex flex-col text-white px-4 pt-4">
      <div className="flex items-center border-b border-white pb-2 mb-4">
        <h1 className="text-2xl font-bold mr-2">Graph Functions</h1>
        <PopoverIcon
          message={`Use graph functions to analyze network structures and relationships. You can explore communities or find the shortest connection between users to better understand how your network is organized.`}
          scale={1.6}
          position="bottom"
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
        <div className="py-3">
          <button
            className="flex items-center gap-2 w-full text-left text-white hover:text-[#7140F4] transition-colors"
            onClick={() => runWithUnsavedCheck(async () => router.push('/community-analysis'))}
          >
            <span>Community analysis</span>
          </button>
        </div>

        <div className="py-3">
          <button
            className="flex items-center gap-2 w-full text-left text-white hover:text-[#7140F4] transition-colors"
            onClick={() => setIsShortestPathModalOpen(true)}
          >
            <span>Find the best path between users</span>
          </button>
        </div>

        <div className="py-3">
          <button
            className="flex items-center gap-2 w-full text-left text-white hover:text-[#7140F4] transition-colors"
            onClick={() => handleSearchBridges()}
          >
            <span>Find graph bridges</span>
          </button>
        </div>
      </div>

      <ShortestPathModal isOpen={isShortestPathModalOpen} onCancel={() => setIsShortestPathModalOpen(false)} onFind={handleSearchPath} />
    </div>
  );
}
