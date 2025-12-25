'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { GraphLink, GraphNode } from '@/types/GraphTypes';
import { useNotification } from '@/app/context/NotificationProvider';
import { useProject } from '@/app/context/ProjectContext';
import { useWorkspace } from '@/app/context/WorkspaceContext';
import { BannerType } from '@/app/components/Popups/Banner';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { GraphData } from '@/app/interface/GraphData';

interface GraphContextType {
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  setGraphData: React.Dispatch<React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>>;
  resetGraphData: () => void;
  addNodeToGraph: (node: GraphNode) => void;
  findNodeInProjectData: (node: GraphNode) => void;
  shortestPath: GraphNode[];
  setShortestPath: React.Dispatch<React.SetStateAction<GraphNode[]>>;
  resetBridgeLinks: () => void;
}

const GraphContext = createContext<GraphContextType>({
  graphData: { nodes: [], links: [] },
  setGraphData: () => {},
  resetGraphData: () => {},
  addNodeToGraph: () => {},
  findNodeInProjectData: () => {},
  shortestPath: [],
  setShortestPath: () => {},
  resetBridgeLinks: () => {},
});

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const { showNotification } = useNotification();
  const {
    projectData,
    loadedProjectName,
    selectedGraphType,
    selectedRelationTypes,
    setFocusedCommunityId,
    focusedCommunityId,
    setFocusedCommunityData,
    focusedCommunityData,
  } = useProject();
  const {
    isInWorkspaceMode,
    workspaceData,
    setHasUnsavedChanges,
    loadWorkspace,
    openedWorkspaceName,
    fetchWorkspaceData,
    setWorkspaceData,
  } = useWorkspace();
  const [shortestPath, setShortestPath] = useState<GraphNode[]>([]);

  useEffect(() => {
    const dataToSet = focusedCommunityId ? focusedCommunityData : isInWorkspaceMode ? workspaceData : projectData;

    setGraphData(dataToSet);
  }, [isInWorkspaceMode, projectData, workspaceData, focusedCommunityId, focusedCommunityData]);

  useEffect(() => {
    setShortestPath([]);
  }, [loadedProjectName, openedWorkspaceName, selectedGraphType, selectedRelationTypes]);

  const resetGraphData = async () => {
    setShortestPath([]);
    resetBridgeLinks();
    setFocusedCommunityId(null);
    setFocusedCommunityData({ nodes: [], links: [] });
    if (isInWorkspaceMode) {
      await loadWorkspace(openedWorkspaceName!);
      await fetchWorkspaceData(openedWorkspaceName!);
    }
    setGraphData(isInWorkspaceMode ? workspaceData : projectData);
    setHasUnsavedChanges(false);
    showNotification('Graph has been reset.', BannerType.INFO);
  };

  const addNodeToGraph = async (node: GraphNode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/graph/menu/membership?add=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            id: node.id,
            name: node.name,
            nodeType: node.nodeType,
          },
        ]),
      });

      if (!response.ok) {
        throw new Error(`Failed to find node: ${node.id} (${response.status})`);
      }

      const data: GraphData = await response.json();

      setWorkspaceData({
        nodes: data.nodes,
        links: data.links,
      });

      showNotification(`Node "${node.name}" found`, BannerType.SUCCESS);

      setHasUnsavedChanges(true);
    } catch (_error) {
      showNotification(`Failed to add node "${node.name}"`, BannerType.ERROR);
    }
  };

  const findNodeInProjectData = async (node: GraphNode) => {
    setGraphData((prev) => {
      const projectNode = projectData.nodes.find((n) => n.id === node.id && n.nodeType === node.nodeType);
      if (!projectNode) {
        showNotification(`Node "${node.name}" not found in project data.`, BannerType.ERROR);
        return prev;
      }

      const nodeExistsInGraph = prev.nodes.some((n) => n.id === projectNode.id && n.nodeType === projectNode.nodeType);
      const updatedNodes = nodeExistsInGraph ? [...prev.nodes] : [...prev.nodes, projectNode];
      const candidateLinks = projectData.links.filter(
        (link) =>
          (link.source === projectNode.id && prev.nodes.some((n) => n.id === link.target)) ||
          (link.target === projectNode.id && prev.nodes.some((n) => n.id === link.source))
      );

      const newLinksToAdd = candidateLinks.filter(
        (cl) => !prev.links.some((pl) => pl.source === cl.source && pl.target === cl.target && pl.relation === cl.relation)
      );

      const updatedLinks = [...prev.links, ...newLinksToAdd];
      if (typeof setHasUnsavedChanges === 'function') {
        setHasUnsavedChanges(true);
      }

      return {
        nodes: updatedNodes,
        links: updatedLinks,
      };
    });
  };

  const resetBridgeLinks = () => {
    setGraphData((prev) => ({
      ...prev,
      links: prev.links.map((link) => ({
        ...link,
        isBridge: false,
      })),
    }));
  };

  return (
    <GraphContext.Provider
      value={{
        graphData,
        setGraphData,
        resetGraphData,
        addNodeToGraph,
        findNodeInProjectData,
        shortestPath,
        setShortestPath,
        resetBridgeLinks,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);
