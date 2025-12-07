'use client';

import { useProject } from '@/app/context/ProjectContext';
import React, { useEffect, useState, useRef } from 'react';
import { Network, Layers, ChevronDown, ChevronUp, Settings, Check } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import { RelationType, NodeType } from '@/types/GraphTypes';
import { GraphQueryRequest, FetchConfig } from '@/types/GraphQueryRequest';
import { isRelationAvailable } from '@/app/utils/nodeRelationMap';
import FetchConfigModal from '@/app/components/Popups/FetchConfigModal';
import PopoverIcon from '@/app/components/Popups/PopoverIcon';
import { useWorkspace } from '@/app/context/WorkspaceContext';

export default function FiltersContent() {
  const {
    selectedRelationTypes,
    selectedNodeTypes,
    setSelectedRelationTypes,
    setSelectedNodeTypes,
    runWithLoading,
    fetchGraphData,
    fetchConfig,
    setFetchConfig,
    focusedCommunityId,
  } = useProject();

  const { showNotification } = useNotification();
  const { isInWorkspaceMode } = useWorkspace();

  const [tempNodeTypes, setTempNodeTypes] = useState<NodeType[]>(selectedNodeTypes);
  const [tempRelationTypes, setTempRelationTypes] = useState<RelationType[]>(selectedRelationTypes);

  const [nodeTypesExpanded, setNodeTypesExpanded] = useState(true);
  const [relationTypesExpanded, setRelationTypesExpanded] = useState(true);
  const [fetchConfigExpanded, setFetchConfigExpanded] = useState(true);

  const [fetchConfigModalOpen, setFetchConfigModalOpen] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempNodeTypes(selectedNodeTypes);
    setTempRelationTypes(selectedRelationTypes);
  }, [selectedNodeTypes, selectedRelationTypes]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const isScrollable = container.scrollHeight > container.clientHeight;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      setShowScrollHint(isScrollable && !isAtBottom);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [nodeTypesExpanded, relationTypesExpanded, fetchConfigExpanded, tempNodeTypes, tempRelationTypes]);

  const toggleNodeType = (nodeType: NodeType) => {
    setTempNodeTypes((prev) => (prev.includes(nodeType) ? prev.filter((t) => t !== nodeType) : [...prev, nodeType]));
  };

  const toggleRelationType = (relationType: RelationType) => {
    setTempRelationTypes((prev) => (prev.includes(relationType) ? prev.filter((t) => t !== relationType) : [...prev, relationType]));
  };

  const allNodeTypes = Object.values(NodeType);
  const allRelationTypes = Object.values(RelationType);

  const areAllNodesSelected = allNodeTypes.length > 0 && allNodeTypes.every((nt) => tempNodeTypes.includes(nt));

  const toggleAllNodes = () => {
    if (areAllNodesSelected) {
      setTempNodeTypes([]);
    } else {
      setTempNodeTypes(allNodeTypes);
    }
  };

  const availableRelations = allRelationTypes.filter((rt) => isRelationAvailable(rt, tempNodeTypes));
  const areAllAvailableRelationsSelected =
    availableRelations.length > 0 && availableRelations.every((rt) => tempRelationTypes.includes(rt));

  const toggleAllRelations = () => {
    if (areAllAvailableRelationsSelected) {
      setTempRelationTypes((prev) => prev.filter((rt) => !availableRelations.includes(rt)));
    } else {
      setTempRelationTypes((prev) => [...new Set([...prev, ...availableRelations])]);
    }
  };

  const handleApply = async () => {
    if (tempNodeTypes.length === 0) return showNotification('Please select at least one node type', BannerType.ERROR);
    if (tempRelationTypes.length === 0) return showNotification('Please select at least one relation type', BannerType.ERROR);

    await runWithLoading(async () => {
      try {
        setSelectedNodeTypes(tempNodeTypes);
        setSelectedRelationTypes(tempRelationTypes);
        const request: GraphQueryRequest = {
          nodeTypes: tempNodeTypes,
          relationTypes: tempRelationTypes,
          fetchConfig: fetchConfig,
          focusedCommunityId: focusedCommunityId,
        };
        await fetchGraphData(request);
        showNotification('Filters applied successfully', BannerType.SUCCESS);
      } catch (err: any) {
        showNotification(`Error updating graph: ${err.message || err}`, BannerType.ERROR);
      }
    });
  };

  const mainScrollbarClass =
    '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7140F4] cursor-pointer';

  return (
    <div className="relative h-full flex flex-col text-[#FAFAFA] px-3 pt-3">
      <div className="flex items-center border-b border-white/20 pb-2 mb-3 shrink-0">
        <h1 className="text-xl font-bold mr-2">Graph Filters</h1>
        <PopoverIcon
          message={`Filter your graph by node and relation types to focus on the most relevant data for your analysis.\n\n**Note:** In workspace mode, filters cannot be applied because the graph always all relation types and workspace's nodes.`}
          scale={1.4}
          position="bottom"
        />
      </div>

      <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto space-y-3 pr-1 ${mainScrollbarClass}`}>
        <div className={`border border-gray-700 rounded-lg bg-[#30303d] ${isInWorkspaceMode ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => setNodeTypesExpanded(!nodeTypesExpanded)}
            className="w-full flex items-center justify-between p-2 hover:bg-[#FAFAFA]/5 transition-colors rounded-t-lg cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#FAFAFA]" />
              <h2 className="text-sm font-bold">Nodes</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7140F4]/20 text-[#7140F4]">{tempNodeTypes.length} selected</span>
            </div>
            {nodeTypesExpanded ? <ChevronUp className="w-4 h-4 cursor-pointer" /> : <ChevronDown className="w-4 h-4 cursor-pointer" />}
          </button>

          {nodeTypesExpanded && (
            <div className="p-2 pt-0">
              <button
                onClick={toggleAllNodes}
                className="group relative flex items-center gap-2 w-full text-left py-1.5 px-2 rounded transition-colors hover:bg-[#FAFAFA]/5 border-b border-white/5 mb-1 cursor-pointer"
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${areAllNodesSelected ? 'bg-[#7140F4] border-[#7140F4]' : 'border-gray-500'}`}
                >
                  {areAllNodesSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                </div>
                <span className="ml-2 text-sm text-[#7140F4] font-bold">{areAllNodesSelected ? 'Deselect All' : 'Select All'}</span>
              </button>

              <div className="space-y-0.5 mt-1">
                {allNodeTypes.map((nodeType) => (
                  <button
                    key={nodeType}
                    onClick={() => toggleNodeType(nodeType)}
                    className="group relative flex items-center gap-2 w-full text-left py-1.5 px-2 rounded transition-colors hover:bg-[#FAFAFA]/5"
                  >
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded transition-all ${
                        tempNodeTypes.includes(nodeType) ? 'bg-[#7140F4]' : 'bg-transparent'
                      }`}
                    />
                    <span
                      className={`ml-2 truncate transition-colors text-sm ${
                        tempNodeTypes.includes(nodeType) ? 'text-[#7140F4] font-medium' : 'text-[#FAFAFA] group-hover:text-[#7140F4]'
                      }`}
                    >
                      {nodeType}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`border border-gray-700 rounded-lg bg-[#30303d] ${isInWorkspaceMode ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => setRelationTypesExpanded(!relationTypesExpanded)}
            className="w-full flex items-center justify-between p-2 hover:bg-[#FAFAFA]/5 transition-colors rounded-t-lg cursor-pointer"
          >
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Network className="w-4 h-4 text-[#FAFAFA]" />
              <h2 className="text-sm font-bold">Relations</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7140F4]/20 text-[#7140F4]">
                {tempRelationTypes.length} selected
              </span>
            </div>
            {relationTypesExpanded ? <ChevronUp className="w-4 h-4 cursor-pointer" /> : <ChevronDown className="w-4 h-4 cursor-pointer" />}
          </button>

          {relationTypesExpanded && (
            <div className="p-2 pt-0">
              <button
                onClick={toggleAllRelations}
                className="group relative flex items-center gap-2 w-full text-left py-1.5 px-2 rounded transition-colors hover:bg-[#FAFAFA]/5 border-b border-white/5 mb-1 cursor-pointer"
                disabled={availableRelations.length === 0}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${areAllAvailableRelationsSelected && availableRelations.length > 0 ? 'bg-[#7140F4] border-[#7140F4]' : 'border-gray-500'}`}
                >
                  {areAllAvailableRelationsSelected && availableRelations.length > 0 && (
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                  )}
                </div>
                <span className="ml-2 text-sm text-[#7140F4] font-bold">
                  {areAllAvailableRelationsSelected ? 'Deselect All' : 'Select All Available'}
                </span>
              </button>

              <div className="space-y-0.5 mt-1">
                {allRelationTypes.map((relationType) => {
                  const isAvailable = isRelationAvailable(relationType, tempNodeTypes);
                  const isSelected = tempRelationTypes.includes(relationType);

                  return (
                    <button
                      key={relationType}
                      onClick={() => isAvailable && toggleRelationType(relationType)}
                      disabled={!isAvailable}
                      className={`group relative flex items-center gap-2 w-full text-left py-1.5 px-2 rounded transition-colors ${
                        isAvailable ? 'hover:bg-[#FAFAFA]/5 cursor-pointer' : 'cursor-not-allowed opacity-40'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded transition-all ${
                          isSelected && isAvailable ? 'bg-[#7140F4]' : 'bg-transparent'
                        }`}
                      />
                      <span
                        className={`ml-2 truncate transition-colors text-sm ${
                          !isAvailable
                            ? 'text-gray-600'
                            : isSelected
                              ? 'text-[#7140F4] font-medium'
                              : 'text-[#FAFAFA] group-hover:text-[#7140F4]'
                        }`}
                      >
                        {relationType}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={`border border-gray-700 rounded-lg bg-[#30303d] ${isInWorkspaceMode ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => setFetchConfigExpanded(!fetchConfigExpanded)}
            className="w-full flex items-center justify-between p-2 hover:bg-[#FAFAFA]/5 transition-colors rounded-t-lg cursor-pointer"
          >
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Settings className="w-4 h-4 text-[#FAFAFA]" />
              <h2 className="text-sm font-bold">Fetch Limits</h2>
            </div>
            {fetchConfigExpanded ? <ChevronUp className="w-4 h-4 cursor-pointer" /> : <ChevronDown className="w-4 h-4 cursor-pointer" />}
          </button>

          {fetchConfigExpanded && (
            <div className="p-2 pt-0">
              <div className="space-y-1 mb-2">
                {tempNodeTypes.map((nodeType) => {
                  const limit = fetchConfig.nodeLimits?.[nodeType] ?? 100;
                  return (
                    <div key={nodeType} className="flex items-center justify-between text-xs px-2 py-1">
                      <span className="text-gray-300">{nodeType}</span>
                      <span className="text-[#7140F4] font-mono bg-[#7140F4]/10 px-1.5 rounded">{limit}</span>
                    </div>
                  );
                })}
                {tempNodeTypes.length === 0 && <span className="text-xs text-gray-500 italic px-2">No nodes selected</span>}
              </div>

              <button
                onClick={() => setFetchConfigModalOpen(true)}
                className="w-full py-1.5 bg-[#7140F4] hover:bg-[#5a33c4] text-[#FAFAFA] text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Configure Limits
              </button>
            </div>
          )}
        </div>
      </div>

      {showScrollHint && (
        <div className="absolute bottom-14 left-0 right-0 h-6 pointer-events-none flex items-center justify-center bg-gradient-to-t from-[#30303d] to-transparent">
          <ChevronDown className="w-4 h-4 text-[#7140F4] animate-bounce" />
        </div>
      )}

      <div className="pt-3 pb-2 border-t border-[#FAFAFA]/20 mt-2 bg-transparent shrink-0">
        <button
          onClick={handleApply}
          disabled={isInWorkspaceMode}
          title={isInWorkspaceMode ? 'Cannot apply filters in workspace mode' : ''}
          className={`w-full py-2.5 text-[#FAFAFA] font-semibold rounded-lg transition-colors text-sm
                ${isInWorkspaceMode ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-[#7140F4] hover:bg-[#5a33c4] cursor-pointer'}`}
        >
          Apply Filters
        </button>
      </div>

      <FetchConfigModal
        open={fetchConfigModalOpen}
        onClose={() => setFetchConfigModalOpen(false)}
        onApply={(config: FetchConfig) => setFetchConfig(config)}
        currentConfig={fetchConfig}
        selectedNodeTypes={tempNodeTypes}
      />
    </div>
  );
}
