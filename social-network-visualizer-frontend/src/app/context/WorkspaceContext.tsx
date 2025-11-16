'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BannerType } from '@/app/components/Popups/Banner';
import { AuthorNode, GraphLink, GraphNode, HashtagNode, NodeType, TweetNode } from '@/types/GraphTypes';
import { useNotification } from '@/app/context/NotificationProvider';
import { useProject } from '@/app/context/ProjectContext';
import LeaveConfirmModal from '@/app/components/Popups/LeaveConfirmModal';
import { useSaveWorkspaceChanges } from '@/app/hooks/useSaveWorkspaceChanges';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import WorkspaceCreateModal from '@/app/components/Popups/WorkspaceCreateModal';

interface WorkspaceContextType {
  isInWorkspaceMode: boolean;
  setIsInWorkspaceMode: (value: boolean) => void;
  openedWorkspaceName: string | null;
  setOpenedWorkspaceName: (workspace: string | null) => void;
  workspaceData: { nodes: GraphNode[]; links: GraphLink[] };
  setWorkspaceData: React.Dispatch<React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>>;
  loadWorkspace: (workspaceName: string) => void;
  fetchWorkspaceData: (workspaceName: string) => Promise<void>;
  saveWorkspaceData: (graphData: { nodes: GraphNode[]; links: GraphLink[] }) => Promise<void>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  runWithUnsavedCheck: <T>(fn: () => Promise<T>) => Promise<void>;
  openWorkspaceCreateModal: (graphData: { nodes: GraphNode[]; links: GraphLink[] }) => void;
  workspaces: string[];
  setWorkspaces: React.Dispatch<React.SetStateAction<string[]>>;
  refreshWorkspaces: (projectName: string) => void;
  createWorkspace: (workspaceName: string) => Promise<void>;
  exportWorkspace: (workspaceName: string) => Promise<void>;
  importWorkspace: (file: File) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  isInWorkspaceMode: false,
  setIsInWorkspaceMode: () => {},
  openedWorkspaceName: null,
  setOpenedWorkspaceName: () => {},
  workspaceData: { nodes: [], links: [] },
  setWorkspaceData: () => {},
  loadWorkspace: async () => {},
  fetchWorkspaceData: async () => {},
  saveWorkspaceData: async () => {},
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
  runWithUnsavedCheck: async () => {},
  openWorkspaceCreateModal: (graphData: { nodes: GraphNode[]; links: GraphLink[] }) => {},
  workspaces: [],
  setWorkspaces: () => {},
  refreshWorkspaces: () => {},
  createWorkspace: async () => {},
  exportWorkspace: async () => {},
  importWorkspace: async () => {},
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInWorkspaceMode, setIsInWorkspaceMode] = useState<boolean>(false);
  const [openedWorkspaceName, setOpenedWorkspaceName] = useState<string | null>(null);
  const [workspaceData, setWorkspaceData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const { showNotification } = useNotification();
  const { runWithLoading, loadedProjectName, setIsSidebarOpen, setNodeFound, setShortestPath, setFocusedCommunityId, setSelectedUserData } =
    useProject();
  const { saveCurrentGraphData } = useSaveWorkspaceChanges();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>(undefined);
  const [isWorkspaceCreateModalOpen, setWorkspaceCreateModalOpen] = useState(false);
  const [pendingGraphData, setPendingGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const [workspaces, setWorkspaces] = useState<string[]>([]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setNodeFound(null);
    setShortestPath([]);
    setFocusedCommunityId(undefined);
    setSelectedUserData(null);
    setHasUnsavedChanges(false);
  }, [openedWorkspaceName, loadedProjectName]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [openedWorkspaceName]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const openWorkspaceCreateModal = (graphData: { nodes: GraphNode[]; links: GraphLink[] }) => {
    setPendingGraphData(graphData);
    setWorkspaceCreateModalOpen(true);
  };

  const closeWorkspaceCreateModal = () => {
    setPendingGraphData({ nodes: [], links: [] });
    setWorkspaceCreateModalOpen(false);
  };

  const loadWorkspace = async (workspaceName: string) =>
    runWithLoading(async () => {
      if (!loadedProjectName) return;
      try {
        const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace/${workspaceName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

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
        const res = await fetch(`http://localhost:8080/project/${loadedProjectName}/workspace`);

        if (!res.ok) {
          const message = `Failed to fetch workspace data: ${res.status} ${res.statusText}`;
          showNotification(message, BannerType.ERROR);
          return;
        }

        let data: any;
        try {
          data = await res.json();
        } catch (parseErr) {
          showNotification('Invalid response format from server.', BannerType.ERROR);
          return;
        }

        if (!Array.isArray(data?.nodes) || !Array.isArray(data?.links)) {
          showNotification('Workspace data format is invalid.', BannerType.ERROR);
          return;
        }

        const links: GraphLink[] = data.links.map((edge: GraphLink) => ({
          source: edge.source,
          target: edge.target,
          relation: edge.relation ?? 'unknown',
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
                community: raw.community?.toString() ?? '',
                pagerank: raw.pagerank ?? 0,
              } as AuthorNode;

            case NodeType.TWEET:
              return {
                ...baseNode,
                nodeType: NodeType.TWEET,
                content: raw.content ?? '',
                authorName: raw.authorName ?? '',
                likesCount: raw.likesCount ?? 0,
                retweetsCount: raw.retweetsCount ?? 0,
                community: raw.community?.toString() ?? '',
              } as TweetNode;

            case NodeType.HASHTAG:
              return {
                ...baseNode,
                nodeType: NodeType.HASHTAG,
              } as HashtagNode;

            default:
              console.error(`Unknown node type encountered: ${raw.nodeType}`, raw);
              return {
                ...baseNode,
                nodeType: NodeType.HASHTAG,
              } as HashtagNode;
          }
        });
        setWorkspaceData({ nodes, links });
        setIsInWorkspaceMode(true);
        showNotification(`Workspace "${openedWorkspaceName}" loaded successfully.`, BannerType.SUCCESS);
      } catch (err: any) {
        showNotification(`Load error: ${err.message}`, BannerType.ERROR);
      }
    });

  const saveWorkspaceData = async (graphData: { nodes: GraphNode[]; links: GraphLink[] }) =>
    runWithLoading(async () => {
      if (!openedWorkspaceName || !loadedProjectName) return;
      try {
        const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: openedWorkspaceName,
            nodes: graphData.nodes,
            edges: graphData.links,
          }),
        });

        if (!res.ok) {
          const message = `Failed to save workspace: ${res.status} ${res.statusText}`;
          showNotification(message, BannerType.ERROR);
          return;
        }

        showNotification(`Workspace saved successfully.`, BannerType.SUCCESS);
      } catch (err) {
        showNotification('Unexpected error while saving workspace data.', BannerType.ERROR);
      }
      setHasUnsavedChanges(false);
    });

  const runWithUnsavedCheck = async <T,>(fn: () => Promise<T>): Promise<void> => {
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
        showNotification('Error executing pending action.', BannerType.ERROR);
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

  const refreshWorkspaces = async (projectName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/project/${projectName}/workspace/list`);
      if (!res.ok) throw new Error('Failed to load workspace list');
      setWorkspaces(await res.json());
    } catch (err: any) {
      showNotification(`Load error: ${err.message}`, BannerType.ERROR);
    }
  };

  const createWorkspace = async (workspaceName: string) => {
    setIsConfirmModalOpen(false);

    await runWithLoading(async () => {
      const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName,
          nodes: pendingGraphData.nodes,
          edges: pendingGraphData.links,
        }),
      });

      if (!res.ok) throw new Error('Failed to create workspace');
      showNotification(`Workspace created successfully.`, BannerType.SUCCESS);
    }).catch((err: any) => {
      showNotification(`Create error: ${err.message}`, BannerType.ERROR);
    });
    await refreshWorkspaces(loadedProjectName!);
    closeWorkspaceCreateModal();
    await loadWorkspace(workspaceName);
  };

  const exportWorkspace = async (workspaceName: string) => {
    if (!loadedProjectName) {
      showNotification('No project loaded', BannerType.ERROR);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace/${workspaceName}/export`);

      if (!res.ok) {
        throw new Error(`Failed to export workspace: ${res.status} ${res.statusText}`);
      }

      const workspaceData = await res.json();
      const dataStr = JSON.stringify(workspaceData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workspaceName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification(`Workspace "${workspaceName}" exported successfully.`, BannerType.SUCCESS);
    } catch (err: any) {
      showNotification(`Export error: ${err.message}`, BannerType.ERROR);
    }
  };

  const importWorkspace = async (file: File) => {
    if (!loadedProjectName) {
      showNotification('No project loaded. Please load a project first.', BannerType.ERROR);
      return;
    }

    if (!file.name.endsWith('.json')) {
      showNotification('Only JSON files are allowed', BannerType.ERROR);
      return;
    }

    await runWithLoading(async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/project/${loadedProjectName}/workspace/import`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          showNotification(errorData.error || 'Failed to import workspace', BannerType.ERROR);
          return;
        }

        const result = await res.json();

        const { workspaceName, totalNodes, importedNodes, totalEdges, importedEdges } = result;

        const isPartialImport = totalNodes > importedNodes || totalEdges > importedEdges;
        const noDataImported = importedNodes === 0 && importedEdges === 0;

        let message: string;
        let bannerType: BannerType;

        if (noDataImported) {
          message = 'Failed to import workspace: No valid nodes or edges found in the database.';
          bannerType = BannerType.ERROR;
        } else if (isPartialImport) {
          message = `Workspace '${workspaceName}' partially imported: ${importedNodes}/${totalNodes} nodes and ${importedEdges}/${totalEdges} edges. Some items were skipped.`;
          bannerType = BannerType.WARNING;
        } else {
          message = `Workspace '${workspaceName}' successfully imported with ${importedNodes} nodes and ${importedEdges} edges.`;
          bannerType = BannerType.SUCCESS;
        }

        showNotification(message, bannerType);

        if (bannerType === BannerType.SUCCESS || bannerType === BannerType.WARNING) {
          await refreshWorkspaces(loadedProjectName);
          await loadWorkspace(workspaceName);
        }
      } catch (err: any) {
        showNotification(`Import error: ${err.message || 'Unknown error occurred'}`, BannerType.ERROR);
      }
    });
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
        runWithUnsavedCheck,
        openWorkspaceCreateModal,
        workspaces,
        setWorkspaces,
        refreshWorkspaces,
        createWorkspace,
        exportWorkspace,
        importWorkspace,
      }}
    >
      {children}

      <WorkspaceCreateModal
        open={isWorkspaceCreateModalOpen}
        projectName={loadedProjectName!}
        onCancel={() => closeWorkspaceCreateModal()}
        handleCreateWorkspace={(workspaceName: string) => createWorkspace(workspaceName)}
        workspaceList={workspaces}
      />
      <LeaveConfirmModal open={isConfirmModalOpen} onSave={handleSave} onDiscard={handleDiscard} onCancel={handleCancel} />
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
