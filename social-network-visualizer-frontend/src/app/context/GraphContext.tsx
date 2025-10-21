"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { GraphLink, GraphNode } from "@/types/GraphTypes";
import { useNotification } from "@/app/context/NotificationProvider";
import { useProject } from "@/app/context/ProjectContext";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { BannerType } from "@/app/components/Popups/Banner";

interface GraphContextType {
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  setGraphData: React.Dispatch<
    React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>
  >;
  resetGraphData: () => void;
  addNodeToGraph: (node: GraphNode) => void;
}

const GraphContext = createContext<GraphContextType>({
  graphData: { nodes: [], links: [] },
  setGraphData: () => {},
  resetGraphData: () => {},
  addNodeToGraph: () => {},
});

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const { showNotification } = useNotification();
  const { projectData } = useProject();
  const {
    isInWorkspaceMode,
    workspaceData,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    openedWorkspaceName,
  } = useWorkspace();

  useEffect(() => {
    if (hasUnsavedChanges) {
      return;
    }

    setGraphData(isInWorkspaceMode ? workspaceData : projectData);
  }, [isInWorkspaceMode, projectData, workspaceData]);

  const resetGraphData = async () => {
    setGraphData(isInWorkspaceMode ? workspaceData : projectData);
    setHasUnsavedChanges(false);
    showNotification("Graph has been reset.", BannerType.INFO);
  };

  const addNodeToGraph = async (node: GraphNode) => {
    setGraphData((prev) => {
      const projectNode = projectData.nodes.find(
        (n) => n.id === node.id && n.nodeType === node.nodeType,
      );
      if (!projectNode) {
        showNotification(
          `Node "${node.id}" not found in project data.`,
          BannerType.ERROR,
        );
        return prev;
      }

      const nodeExistsInGraph = prev.nodes.some(
        (n) => n.id === projectNode.id && n.nodeType === projectNode.nodeType,
      );
      const updatedNodes = nodeExistsInGraph
        ? [...prev.nodes]
        : [...prev.nodes, projectNode];
      const candidateLinks = projectData.links.filter(
        (link) =>
          (link.source === projectNode.id &&
            prev.nodes.some((n) => n.id === link.target)) ||
          (link.target === projectNode.id &&
            prev.nodes.some((n) => n.id === link.source)),
      );

      const newLinksToAdd = candidateLinks.filter(
        (cl) =>
          !prev.links.some(
            (pl) =>
              pl.source === cl.source &&
              pl.target === cl.target &&
              pl.relation === cl.relation,
          ),
      );

      const updatedLinks = [...prev.links, ...newLinksToAdd];
      if (typeof setHasUnsavedChanges === "function") {
        setHasUnsavedChanges(true);
      }

      return {
        nodes: updatedNodes,
        links: updatedLinks,
      };
    });
  };

  return (
    <GraphContext.Provider
      value={{
        graphData,
        setGraphData,
        resetGraphData,
        addNodeToGraph,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);
