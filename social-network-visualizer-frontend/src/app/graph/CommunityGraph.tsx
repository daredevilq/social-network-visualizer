'use client';
// @ts-ignore
import { useEffect, useState } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { FolderPlus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import {AuthorNode, GraphLink, GraphNode, MetricConfig} from '@/types/GraphTypes';
import Colors from '../utils/Colors';
import { useGraph } from '@/app/context/GraphContext';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import linkStrategy from '@/app/model/strategies/LinkStrategy';
import nodeStrategy from '@/app/model/strategies/NodeStrategy';

const BaseGraph = dynamic(() => import('./BaseGraph'), { ssr: false });

export default function CommunityGraph() {
  const { loadedProjectName, nodeFound, runWithLoading } = useProject();
  const { focusedCommunityId } = useProject();
  const { isInWorkspaceMode } = useWorkspace();
  const { graphData, setGraphData, shortestPath } = useGraph();

  const NUMBER_OF_COMMUNITIES = 15;
  const { showNotification } = useNotification();

  const [filteredGraphData, setFilteredGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [metricConfig, setMetricConfig] = useState<MetricConfig | null>(null);

  useEffect(() => {
    if (!loadedProjectName) return;

    const fetchMetricConfig = async () => {
      await runWithLoading(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/community/${loadedProjectName}/metric-config`);
          if (!res.ok) {
            if (res.status === 404) {
              showNotification(`No COMMUNITY metric configuration found for project "${loadedProjectName}"`, BannerType.WARNING);
              return;
            }
            throw new Error(`Failed to fetch metric config: ${res.status}`);
          }

          const config: MetricConfig = await res.json();
          setMetricConfig(config);
        } catch (err) {
          console.error('Error fetching metric config:', err);
          showNotification('Failed to load community metric configuration.', BannerType.ERROR);
        }
      });
    };

    fetchMetricConfig();
  }, [loadedProjectName]);

  useEffect(() => {
    if (!loadedProjectName || !metricConfig || !graphData?.nodes?.length) {
      setFilteredGraphData({ nodes: [], links: [] });
      return;
    }

    // for now allowedNodeTypes is only AuthorNodes - because we compute community only for Authors
    const allowedNodeTypes = new Set(metricConfig.nodeTypes);
    const filteredNodes = graphData.nodes.filter((node) => allowedNodeTypes.has(node.nodeType));

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks: GraphLink[] = graphData.links.filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));

    setFilteredGraphData({ nodes: filteredNodes, links: filteredLinks });
  }, [loadedProjectName, metricConfig, graphData]);

  const getNodeColor = (node: GraphNode): string => {
    if (nodeFound && node.id === nodeFound.id && node.nodeType === nodeFound.nodeType) {
      return Colors.RedColor();
    }
    return nodeStrategy.getCommunityColor(node);
  };

  const getLinkColor = (link: GraphLink): string => {
    if (Array.isArray(shortestPath) && shortestPath.includes(link.source) && shortestPath.includes(link.target)) {
      return Colors.RedColor();
    }
    if (metricConfig?.relationTypes?.includes(link.relation)) {
      return Colors.GoldColor();
    }
    return linkStrategy.getColor(link);
  };

  const getLinkWidth = (link: GraphLink): number => {
    if (Array.isArray(shortestPath) && shortestPath.includes(link.source) && shortestPath.includes(link.target)) {
      return 6;
    }
    return linkStrategy.getWidth(link);
  };

  if (!loadedProjectName) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#fafafa]">
        <FolderPlus className="w-12 h-12 mb-4 text-[#fafafa]/60" />
        <p className="text-lg font-medium text-[#fafafa]/80">Select a project to get started</p>
        <p className="text-sm text-[#fafafa]/50 mt-1">Use the sidebar to pick one</p>
      </div>
    );
  }

  if (!metricConfig) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#fafafa]">
        <p className="text-lg font-medium text-[#fafafa]/80">No community configuration available</p>
        <p className="text-sm text-[#fafafa]/50 mt-1">Check project settings</p>
      </div>
    );
  }

  return (
    <BaseGraph
      graphData={graphData}
      nodeVal={(node: GraphNode) => {
        // TODO: Add a strategy pattern for node sizing depends on pagerank or other metrics in community graph
        const authorNode = node as AuthorNode;
        return Math.min(authorNode.pagerank ? authorNode.pagerank * 7 : 10, 30);
      }}
      nodeLabel={(node: GraphNode) => `${node.name}` + ` || Community: ${node.community}`}
      nodeColor={(node) => (node.id === nodeFound?.id && node.nodeType === nodeFound?.nodeType ? Colors.RedColor() : getNodeColor(node))}
      linkLabel={(link: GraphLink) => `${link.relation}`}
      linkColor={(link: GraphLink) => Colors.WhiteColor()}
      linkWidth={(link: GraphLink) => 2}
      linkDirectionalArrowLength={8}
      linkDirectionalArrowRelPos={1}
      nodeFound={nodeFound}
    />
  );
}
