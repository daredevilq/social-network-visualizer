'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/configuration/urlConfig';
import { GraphType } from '@/app/interface/GraphType';
import { getGraphUiType, getProjectName, setProjectName } from '@/app/project-state';
import { useNotification } from '@/app/context/NotificationProvider';
import { BannerType } from '@/app/components/Popups/Banner';
import { AuthorNode, GraphLink, GraphNode, HashtagNode, NodeType, RelationType, TweetNode } from '@/types/GraphTypes';
import { FetchConfig, GraphQueryRequest } from '@/types/GraphQueryRequest';
import { DEFAULT_FETCH_CONFIG } from '@/app/utils/defaultFetchConfig';

interface Context {
  loadedProjectName: string | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadProject: (name: string, fetchData: boolean) => Promise<void>;
  runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
  fetchGraphData: (request?: GraphQueryRequest) => Promise<void>;
  isLabelsMode: true | false;
  setIsLabelsMode: React.Dispatch<React.SetStateAction<true | false>>;
  projectData: { nodes: GraphNode[]; links: GraphLink[] };
  setProjectData: React.Dispatch<React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>>;
  nodeFound: GraphNode | null;
  setNodeFound: React.Dispatch<React.SetStateAction<GraphNode | null>>;
  shortestPath: string[];
  setShortestPath: React.Dispatch<React.SetStateAction<string[]>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUserData: BasicUserData | null;
  setSelectedUserData: React.Dispatch<React.SetStateAction<BasicUserData | null>>;
  selectedNodeTypes: NodeType[];
  setSelectedNodeTypes: React.Dispatch<React.SetStateAction<NodeType[]>>;
  selectedRelationTypes: RelationType[];
  setSelectedRelationTypes: React.Dispatch<React.SetStateAction<RelationType[]>>;
  focusedCommunityId?: string;
  setFocusedCommunityId: (id?: string) => void;
  selectedGraphType: GraphType;
  setSelectedGraphType: (g: GraphType) => void;
  showLabels: boolean;
  setShowLabels: React.Dispatch<React.SetStateAction<boolean>>;
  fetchConfig: FetchConfig;
  setFetchConfig: React.Dispatch<React.SetStateAction<FetchConfig>>;
}

const ProjectContext = createContext<Context>({
  loadedProjectName: null,
  loading: false,
  setLoading: () => {},
  loadProject: async () => {},
  runWithLoading: async (fn) => fn(),
  fetchGraphData: async () => {},
  isLabelsMode: true,
  setIsLabelsMode: () => {},
  projectData: { nodes: [], links: [] },
  setProjectData: () => {},
  nodeFound: null,
  setNodeFound: () => {},
  shortestPath: [],
  setShortestPath: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  selectedUserData: null,
  setSelectedUserData: () => {},
  selectedNodeTypes: [NodeType.AUTHOR],
  setSelectedNodeTypes: () => {},
  selectedRelationTypes: [RelationType.MENTIONS],
  setSelectedRelationTypes: () => {},
  focusedCommunityId: undefined,
  setFocusedCommunityId: () => {},
  selectedGraphType: GraphType.STANDARD,
  setSelectedGraphType: () => {},
  showLabels: false,
  setShowLabels: () => {},
  fetchConfig: DEFAULT_FETCH_CONFIG,
  setFetchConfig: () => {},
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadedProjectName, setLoadedProjectName] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<BasicUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLabelsMode, setIsLabelsMode] = useState(false);
  const [projectData, setProjectData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });
  const [nodeFound, setNodeFound] = useState<GraphNode | null>(null);
  const [shortestPath, setShortestPath] = useState<string[]>([]);
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<NodeType[]>([NodeType.AUTHOR]);
  const [selectedRelationTypes, setSelectedRelationTypes] = useState<RelationType[]>([RelationType.MENTIONS]);
  const [focusedCommunityId, setFocusedCommunityId] = useState<string | undefined>();
  const [selectedGraphType, setSelectedGraphType] = useState<GraphType>(GraphType.STANDARD);
  const [showLabels, setShowLabels] = useState(false);
  const [fetchConfig, setFetchConfig] = useState<FetchConfig>(DEFAULT_FETCH_CONFIG);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProjectState = async () => {
      const name = await getProjectName();
      const uiType = await getGraphUiType();

      setLoadedProjectName(name);
      setSelectedGraphType(uiType);
    };

    fetchProjectState();
  }, []);

  useEffect(() => {
    if (loadedProjectName) {
      fetchGraphData();
    }
  }, [loadedProjectName]);

  const runWithLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
    if (loading) return fn();
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (name: string, fetchData: boolean = false) => {
    await runWithLoading(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/project/${name}/import`, {
          method: 'POST',
        });

        if (!res.ok) {
          throw new Error(`Failed to import project: ${res.statusText}`);
        }
        setLoadedProjectName(name);
        await setProjectName(name);
        setNodeFound(null);

        showNotification(`Successfully loaded project: ${name}`, BannerType.SUCCESS);
      } catch (err) {
        showNotification(`Error loading project "${name}".`, BannerType.ERROR);
      }
    });
  };

  const fetchGraphData = async (request?: GraphQueryRequest, projectNameOverride?: string) =>
    runWithLoading(async () => {
      const projectName = projectNameOverride ?? loadedProjectName;

      if (!projectName) return;

      try {
        const graphQuery: GraphQueryRequest = request ?? {
          nodeTypes: selectedNodeTypes,
          relationTypes: selectedRelationTypes,
          fetchConfig: fetchConfig,
        };

        const res = await fetch(`${API_BASE_URL}/graph`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(graphQuery),
        });

        if (!res.ok) {
          const message = `Failed to fetch graph data: ${res.status} ${res.statusText}`;
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
          showNotification('Graph data format is invalid.', BannerType.ERROR);
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
                centrality: raw.centrality ?? 0,
              } as AuthorNode;

            case NodeType.TWEET:
              return {
                ...baseNode,
                nodeType: NodeType.TWEET,
                content: raw.content ?? '',
                authorName: raw.authorName ?? '',
                likesCount: raw.likesCount ?? 0,
                retweetsCount: raw.retweetsCount ?? 0,
                community: raw.community ?? -1,
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
        setProjectData({ nodes, links });
      } catch (err) {
        showNotification('Unexpected error while fetching graph data.', BannerType.ERROR);
      }
    });

  return (
    <ProjectContext.Provider
      value={{
        loadedProjectName,
        loading,
        setLoading,
        loadProject,
        runWithLoading,
        fetchGraphData,
        isLabelsMode,
        setIsLabelsMode,
        projectData: projectData,
        setProjectData,
        nodeFound,
        setNodeFound,
        shortestPath,
        setShortestPath,
        isSidebarOpen,
        setIsSidebarOpen,
        selectedUserData,
        setSelectedUserData,
        selectedNodeTypes,
        setSelectedNodeTypes,
        selectedRelationTypes,
        setSelectedRelationTypes,
        focusedCommunityId,
        setFocusedCommunityId,
        selectedGraphType,
        setSelectedGraphType,
        showLabels,
        setShowLabels,
        fetchConfig,
        setFetchConfig,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
