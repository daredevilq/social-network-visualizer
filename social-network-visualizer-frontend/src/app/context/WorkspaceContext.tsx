"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BannerType } from "@/app/components/Popups/Banner";
import {
  AuthorNode,
  GraphLink,
  GraphNode,
  HashtagNode,
  NodeType,
  TweetNode,
} from "@/types/GraphTypes";
import { useNotification } from "@/app/context/NotificationProvider";
import { useProject } from "@/app/context/ProjectContext";
import LeaveConfirmModal from "@/app/components/Popups/LeaveConfirmModal";
import { useSaveWorkspaceChanges } from "@/app/hooks/useSaveWorkspaceChanges";
import { API_BASE_URL } from "@/app/configuration/urlConfig";

interface WorkspaceContextType {
  isInWorkspaceMode: boolean;
  setIsInWorkspaceMode: (value: boolean) => void;
  openedWorkspaceName: string | null;
  setOpenedWorkspaceName: (workspace: string | null) => void;
  workspaceData: { nodes: GraphNode[]; links: GraphLink[] };
  setWorkspaceData: React.Dispatch<
    React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>
  >;
  loadWorkspace: (workspaceName: string) => void;
  fetchWorkspaceData: (workspaceName: string) => Promise<void>;
  saveWorkspaceData: (graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  }) => Promise<void>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConfirmModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  runWithUnsavedCheck: <T>(fn: () => Promise<T>) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  isInWorkspaceMode: false,
  setIsInWorkspaceMode: () => {},
  openedWorkspaceName: null,
  setOpenedWorkspaceName: () => {},
  workspaceData: { nodes: [], links: [] },
  setWorkspaceData: () => {},
  loadWorkspace: (workspaceName: string) => {},
  fetchWorkspaceData: async (workspaceName: string) => {},
  saveWorkspaceData: async (graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  }) => {},
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
  setIsConfirmModalOpen: () => {},
  runWithUnsavedCheck: async (fn) => {
    return;
  },
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInWorkspaceMode, setIsInWorkspaceMode] = useState<boolean>(false);
  const [openedWorkspaceName, setOpenedWorkspaceName] = useState<string | null>(
    null,
  );
  const [workspaceData, setWorkspaceData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const { showNotification } = useNotification();
  const { runWithLoading, loadedProjectName } = useProject();
  const { saveCurrentGraphData } = useSaveWorkspaceChanges();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchWorkspaceData();
  }, [openedWorkspaceName]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
      return undefined;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const loadWorkspace = async (workspaceName: string) =>
    runWithLoading(async () => {
      if (!loadedProjectName) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/project/${loadedProjectName}/workspace/${workspaceName}/load`,
        );

        if (!res.ok) {
          const message = `Failed to load workspace data: ${res.status} ${res.statusText}`;
          showNotification(message, BannerType.ERROR);
          return;
        }

        setOpenedWorkspaceName(workspaceName);
        setIsInWorkspaceMode(true);
      } catch (err: any) {
        showNotification(`Load error: ${err.message}`, BannerType.ERROR);
      }
    });

  const fetchWorkspaceData = async () =>
    runWithLoading(async () => {
      if (!openedWorkspaceName || !loadedProjectName) return;
      try {
        const res = await fetch(
          `http://localhost:8080/project/${loadedProjectName}/workspace`,
        );

        if (!res.ok) {
          const message = `Failed to fetch workspace data: ${res.status} ${res.statusText}`;
          showNotification(message, BannerType.ERROR);
          return;
        }

        let data: any;
        try {
          data = await res.json();
        } catch (parseErr) {
          showNotification(
            "Invalid response format from server.",
            BannerType.ERROR,
          );
          return;
        }

        if (!Array.isArray(data?.nodes) || !Array.isArray(data?.links)) {
          showNotification(
            "Workspace data format is invalid.",
            BannerType.ERROR,
          );
          return;
        }

        const links: GraphLink[] = data.links.map((edge: GraphLink) => ({
          source: edge.source,
          target: edge.target,
          relation: edge.relation ?? "unknown",
        }));

        const nodes: GraphNode[] = (data.nodes ?? []).map((raw: any) => {
          const baseNode: GraphNode = {
            id: raw.id,
            nodeType: raw.nodeType,
          };

          switch (raw.nodeType) {
            case NodeType.AUTHOR:
              return {
                ...baseNode,
                nodeType: NodeType.AUTHOR,
                community: raw.community?.toString() ?? "",
                pagerank: raw.pagerank ?? 0,
                centrality: raw.centrality ?? 0,
              } as AuthorNode;

            case NodeType.TWEET:
              return {
                ...baseNode,
                nodeType: NodeType.TWEET,
                content: raw.content ?? "",
                authorName: raw.authorName ?? "",
                likesCount: raw.likesCount ?? 0,
                retweetsCount: raw.retweetsCount ?? 0,
                community: raw.community?.toString() ?? "",
              } as TweetNode;

            case NodeType.HASHTAG:
              return {
                ...baseNode,
                nodeType: NodeType.HASHTAG,
              } as HashtagNode;

            default:
              console.error(
                `Unknown node type encountered: ${raw.nodeType}`,
                raw,
              );
              return {
                ...baseNode,
                nodeType: NodeType.HASHTAG,
              } as HashtagNode;
          }
        });
        setWorkspaceData({ nodes, links });
        setIsInWorkspaceMode(true);
        showNotification(
          `Workspace "${openedWorkspaceName}" loaded successfully.`,
          BannerType.SUCCESS,
        );
      } catch (err: any) {
        showNotification(`Load error: ${err.message}`, BannerType.ERROR);
      }
    });

  const saveWorkspaceData = async (graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  }) =>
    runWithLoading(async () => {
      if (!openedWorkspaceName || !loadedProjectName) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/project/${loadedProjectName}/workspace`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: openedWorkspaceName,
              nodes: graphData.nodes,
              edges: graphData.links,
            }),
          },
        );

        if (!res.ok) {
          const message = `Failed to save workspace: ${res.status} ${res.statusText}`;
          showNotification(message, BannerType.ERROR);
          return;
        }

        showNotification(`Workspace saved successfully.`, BannerType.SUCCESS);
      } catch (err) {
        showNotification(
          "Unexpected error while saving workspace data.",
          BannerType.ERROR,
        );
      }
      setHasUnsavedChanges(false);
    });

  const runWithUnsavedCheck = async <T,>(
    fn: () => Promise<T>,
  ): Promise<void> => {
    if (hasUnsavedChanges && isInWorkspaceMode) {
      setPendingAction(() => fn);
      setIsConfirmModalOpen(true);
      return;
    }

    await fn();
  };

  const handleSave = async () => {
    await saveCurrentGraphData();
    if (pendingAction) {
      await pendingAction();
      setPendingAction(undefined);
    }
    setIsConfirmModalOpen(false);
  };

  const handleDiscard = async () => {
    if (pendingAction) {
      try {
        await pendingAction();
        setIsInWorkspaceMode(false);
        setOpenedWorkspaceName(null);
        setWorkspaceData({ nodes: [], links: [] });
      } catch (err) {
        showNotification("Error executing pending action.", BannerType.ERROR);
      }
    }

    setPendingAction(undefined);
    setHasUnsavedChanges(false);
    setIsConfirmModalOpen(false);
  };

  const handleCancel = async () => {
    setPendingAction(undefined);
    setIsConfirmModalOpen(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        isInWorkspaceMode,
        setIsInWorkspaceMode,
        openedWorkspaceName,
        setOpenedWorkspaceName,
        workspaceData,
        setWorkspaceData,
        loadWorkspace,
        fetchWorkspaceData,
        saveWorkspaceData,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        setIsConfirmModalOpen,
        runWithUnsavedCheck,
      }}
    >
      {children}

      <LeaveConfirmModal
        open={isConfirmModalOpen}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
