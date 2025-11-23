'use client';

import { useProject } from '@/app/context/ProjectContext';
import React, { useEffect, useState, useRef } from 'react';
import { Network, Layers, ChevronDown, ChevronUp, Search, Settings } from 'lucide-react';
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
  } = useProject();

  const { showNotification } = useNotification();

  const [tempNodeTypes, setTempNodeTypes] = useState<NodeType[]>(selectedNodeTypes);
  const [tempRelationTypes, setTempRelationTypes] = useState<RelationType[]>(selectedRelationTypes);

  const [nodeTypesExpanded, setNodeTypesExpanded] = useState(true);
  const [relationTypesExpanded, setRelationTypesExpanded] = useState(true);
  const [fetchConfigExpanded, setFetchConfigExpanded] = useState(true);
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [relationSearchQuery, setRelationSearchQuery] = useState('');
  const [fetchConfigModalOpen, setFetchConfigModalOpen] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isInWorkspaceMode } = useWorkspace();

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
  }, [nodeTypesExpanded, relationTypesExpanded, fetchConfigExpanded]);

  const toggleNodeType = (nodeType: NodeType) => {
    setTempNodeTypes((prev) => (prev.includes(nodeType) ? prev.filter((t) => t !== nodeType) : [...prev, nodeType]));
  };

  const toggleRelationType = (relationType: RelationType) => {
    setTempRelationTypes((prev) => (prev.includes(relationType) ? prev.filter((t) => t !== relationType) : [...prev, relationType]));
  };

  const handleApply = async () => {
    if (tempNodeTypes.length === 0) {
      showNotification('Please select at least one node type', BannerType.ERROR);
      return;
    }

    if (tempRelationTypes.length === 0) {
      showNotification('Please select at least one relation type', BannerType.ERROR);
      return;
    }

    await runWithLoading(async () => {
      try {
        setSelectedNodeTypes(tempNodeTypes);
        setSelectedRelationTypes(tempRelationTypes);

        const request: GraphQueryRequest = {
          nodeTypes: tempNodeTypes,
          relationTypes: tempRelationTypes,
          fetchConfig: fetchConfig,
        };
        await fetchGraphData(request);
        showNotification('Filters applied successfully', BannerType.SUCCESS);
      } catch (err: any) {
        showNotification(`Error updating graph: ${err.message || err}`, BannerType.ERROR);
      }
    });
  };

  const filteredNodeTypes = Object.values(NodeType).filter((nodeType) => nodeType.toLowerCase().includes(nodeSearchQuery.toLowerCase()));

  const filteredRelationTypes = Object.values(RelationType).filter((relationType) =>
    relationType.toLowerCase().includes(relationSearchQuery.toLowerCase())
  );

  return (
    <div className="relative h-full flex flex-col text-[#FAFAFA] px-4 pt-4">
      <div className="flex items-center border-b border-white pb-2 mb-4">
        <h1 className="text-2xl font-bold mr-2">Graph Filters</h1>
        <PopoverIcon
          message={`Filter your graph by node and relation types to focus on the most relevant data for your analysis.\n\n**Note:** In workspace mode, filters cannot be applied because the graph always saves all data.`}
          scale={1.6}
          position="bottom"
        />
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 scrollbar-none">
        <div className={`border border-gray-700 rounded-lg bg-[#30303d] ${isInWorkspaceMode ? 'opacity-40 pointer-events-none' : ''}`}>
          <button
            onClick={() => setNodeTypesExpanded(!nodeTypesExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#FAFAFA]/5 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-[#FAFAFA]" />
              <h2 className="text-lg font-semibold">Nodes</h2>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#7140F4]/20 text-[#7140F4]">{tempNodeTypes.length} selected</span>
              <PopoverIcon
                message={`Select which **node types** will appear in your graph. These define the main entities included in the analysis.`}
                scale={1.4}
                position="right"
              />
            </div>
            {nodeTypesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {nodeTypesExpanded && (
            <div className="p-3 pt-0">
              {Object.values(NodeType).length > 5 && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search node types..."
                    value={nodeSearchQuery}
                    onChange={(e) => setNodeSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#262631] border border-gray-600 rounded-lg text-sm text-[#FAFAFA] placeholder:text-gray-400 focus:outline-none focus:border-[#7140F4]"
                  />
                </div>
              )}

              <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-dark">
                {filteredNodeTypes.map((nodeType) => (
                  <button
                    key={nodeType}
                    onClick={() => toggleNodeType(nodeType)}
                    className="group relative flex items-center gap-3 w-full text-left py-2 px-3 rounded transition-colors hover:bg-[#FAFAFA]/5"
                  >
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded transition-all ${
                        tempNodeTypes.includes(nodeType) ? 'bg-[#7140F4]' : 'bg-transparent'
                      }`}
                    />
                    <span
                      className={`ml-3 truncate transition-colors ${
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

        <div className={`border border-gray-700 rounded-lg bg-[#30303d] ${isInWorkspaceMode ? 'opacity-40 pointer-events-none' : ''}`}>
          <button
            onClick={() => setRelationTypesExpanded(!relationTypesExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#FAFAFA]/5 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-1.5">
              <Network className="w-5 h-5 text-[#FAFAFA]" />
              <h2 className="text-lg font-semibold">Relations</h2>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#7140F4]/20 text-[#7140F4]">{tempRelationTypes.length} selected</span>
              <PopoverIcon
                message={`Choose **relation types** connecting your selected nodes. Some relations are **unavailable** until their related node types are selected.`}
                scale={1.4}
                position="right"
              />
            </div>
            {relationTypesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {relationTypesExpanded && (
            <div className="p-3 pt-0">
              {Object.values(RelationType).length > 5 && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search relation types..."
                    value={relationSearchQuery}
                    onChange={(e) => setRelationSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#262631] border border-gray-600 rounded-lg text-sm text-[#FAFAFA] placeholder:text-gray-400 focus:outline-none focus:border-[#7140F4]"
                  />
                </div>
              )}

              <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-dark">
                {filteredRelationTypes.map((relationType) => {
                  const isAvailable = isRelationAvailable(relationType, tempNodeTypes);
                  const isSelected = tempRelationTypes.includes(relationType);

                  return (
                    <button
                      key={relationType}
                      onClick={() => isAvailable && toggleRelationType(relationType)}
                      disabled={!isAvailable}
                      className={`group relative flex items-center gap-3 w-full text-left py-2 px-3 rounded transition-colors ${
                        isAvailable ? 'hover:bg-[#FAFAFA]/5 cursor-pointer' : 'cursor-not-allowed opacity-40'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded transition-all ${
                          isSelected && isAvailable ? 'bg-[#7140F4]' : 'bg-transparent'
                        }`}
                      />
                      <span
                        className={`ml-3 truncate transition-colors ${
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

        <div className={`border border-gray-700 rounded-lg bg-[#30303d] ${isInWorkspaceMode ? 'opacity-40 pointer-events-none' : ''}`}>
          <button
            onClick={() => setFetchConfigExpanded(!fetchConfigExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#FAFAFA]/5 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-1.5">
              <Settings className="w-5 h-5 text-[#FAFAFA]" />
              <h2 className="text-lg font-semibold">Fetch Limits</h2>
              <PopoverIcon
                message={`Set how many nodes of each type will be **fetched** from the database. Use this to control performance and data volume.`}
                scale={1.4}
                position="right"
              />
            </div>
            {fetchConfigExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {fetchConfigExpanded && (
            <div className="p-3 pt-0">
              <p className="text-sm text-gray-400 mb-3">Control how many nodes to fetch from the database for each type.</p>

              <div className="space-y-2 mb-3">
                {tempNodeTypes.map((nodeType) => {
                  const limit = fetchConfig.nodeLimits?.[nodeType] ?? 100;
                  return (
                    <div key={nodeType} className="flex items-center justify-between text-sm">
                      <span className="text-[#FAFAFA]">{nodeType}</span>
                      <span className="text-[#7140F4] font-mono">{limit}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setFetchConfigModalOpen(true)}
                className="w-full py-2 bg-[#7140F4] hover:bg-[#5a33c4] text-[#FAFAFA] font-semibold rounded-lg transition-colors"
              >
                Configure Limits
              </button>
            </div>
          )}
        </div>
      </div>

      {showScrollHint && (
        <div className="absolute bottom-16 left-0 right-0 h-8 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-5 h-5 text-[#7140F4] animate-bounce" />
        </div>
      )}

      <div className="pt-4 pb-2 border-t border-[#FAFAFA]/20 mt-4">
        <button
          onClick={handleApply}
          disabled={isInWorkspaceMode}
          title={isInWorkspaceMode ? 'Cannot apply filters in workspace mode' : ''}
          className={`w-full py-3 text-[#FAFAFA] font-semibold rounded-lg transition-colors
                ${isInWorkspaceMode ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-[#7140F4] hover:bg-[#5a33c4]'}`}
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
