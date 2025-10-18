'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {API_BASE_URL} from "@/app/configuration/urlConfig";
import {GraphType} from "@/app/interface/GraphType";
import {getGraphType, getGraphUiType, getProjectName, setGraphType, setProjectName} from "@/app/project-state";
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";
import {AuthorNode, GraphLink, GraphNode, HashtagNode, NodeType, TweetNode} from "@/types/GraphTypes";

interface Context {
    loadedProjectName: string | null;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    loadProject: (name: string, fetchData: boolean) => Promise<void>;
    runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
    fetchGraphData: () => Promise<void>;
    isLabelsMode: true | false;
    setIsLabelsMode: React.Dispatch<React.SetStateAction<true | false>>;
    projectData: { nodes: GraphNode[], links: GraphLink[] };
    setProjectData: React.Dispatch<React.SetStateAction<{ nodes: GraphNode[], links: GraphLink[] }>>;
    nodeFound: GraphNode | null;
    setNodeFound: React.Dispatch<React.SetStateAction<GraphNode | null>>;
    shortestPath: string[];
    setShortestPath: React.Dispatch<React.SetStateAction<string[]>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedUserData: BasicUserData | null;
    setSelectedUserData: React.Dispatch<React.SetStateAction<BasicUserData | null>>;
    graphRelationType: string;
    updateGraphType: (name: string) => Promise<void>;
    focusedCommunityId?: string;
    setFocusedCommunityId: (id?: string) => void;
    selectedGraphType: GraphType;
    setSelectedGraphType: (g: GraphType) => void;
    showLabels: boolean;
    setShowLabels: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectContext = createContext<Context>({
    loadedProjectName: null,
    loading: false,
    setLoading: () => {
    },
    loadProject: async () => {
    },
    runWithLoading: async (fn) => fn(),
    fetchGraphData: async () => {
    },
    isLabelsMode: true,
    setIsLabelsMode: () => {
    },
    projectData: {nodes: [], links: []},
    setProjectData: () => {
    },
    nodeFound: null,
    setNodeFound: () => {
    },
    shortestPath: [],
    setShortestPath: () => {
    },
    isSidebarOpen: false,
    setIsSidebarOpen: () => {
    },
    selectedUserData: null,
    setSelectedUserData: () => {
    },
    graphRelationType: "mentions",
    updateGraphType: async () => {
    },
    focusedCommunityId: undefined,
    setFocusedCommunityId: () => {
    },
    selectedGraphType: GraphType.STANDARD,
    setSelectedGraphType: () => {
    },
    showLabels: false,
    setShowLabels: () => {
    },
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({children}: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState<string | null>(null)
    const [selectedUserData, setSelectedUserData] = useState<BasicUserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLabelsMode, setIsLabelsMode] = useState(false);
    const [projectData, setProjectData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({nodes: [], links: []});
    const [nodeFound, setNodeFound] = useState<GraphNode | null>(null);
    const [shortestPath, setShortestPath] = useState<string[]>([]);
    const [graphRelationType, setGraphRelationType] = useState<string>("mentions");
    const [focusedCommunityId, setFocusedCommunityId] = useState<string | undefined>();
    const [selectedGraphType, setSelectedGraphType] = useState<GraphType>(GraphType.STANDARD);
    const [showLabels, setShowLabels] = useState(false);
    const {showNotification} = useNotification();

    useEffect(() => {
        const fetchProjectState = async () => {
            const name = await getProjectName()
            const type = await getGraphType();
            const uiType = await getGraphUiType();

            setLoadedProjectName(name);
            setGraphRelationType(type);
            setSelectedGraphType(uiType);
        }

        fetchProjectState();
    }, [])

    const updateGraphType = async (graphType: string) => {
        await setGraphType(graphType);
        setGraphRelationType(graphType);
    };

    const runWithLoading = async <T, >(fn: () => Promise<T>): Promise<T> => {
        if (loading) return fn();
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    };

    const loadProject = async (name: string, fetchData: boolean = false) => {
        runWithLoading(async () => {
            try {

                const res = await fetch(`${API_BASE_URL}/project/${name}/import?graph-type=${graphRelationType}`, {
                    method: "POST",
                });

                if (!res.ok) {
                    throw new Error(`Failed to import project: ${res.statusText}`);
                }

                setLoadedProjectName(name);
                await setProjectName(name);
                setNodeFound(null);

                showNotification(`Successfully loaded project: ${name}`, BannerType.SUCCESS);

                if (fetchData) await fetchGraphData();
            } catch (err) {
                showNotification(`Error loading project "${name}".`, BannerType.ERROR);
            }
        });
    };

    const fetchGraphData = async () =>
        runWithLoading(async () => {
            if (!loadedProjectName) return;
            try {
                const res = await fetch(`http://localhost:8080/graph/${graphRelationType}`);

                if (!res.ok) {
                    const message = `Failed to fetch graph data: ${res.status} ${res.statusText}`;
                    showNotification(message, BannerType.ERROR);
                    return;
                }

                let data: any;
                try {
                    data = await res.json();
                } catch (parseErr) {
                    showNotification("Invalid response format from server.", BannerType.ERROR);
                    return;
                }

                if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges)) {
                    showNotification("Graph data format is invalid.", BannerType.ERROR);
                    return;
                }

                const links: GraphLink[] = data.edges.map((edge: GraphLink) => ({
                    source: edge.source,
                    target: edge.target,
                    relation: edge.relation ?? "unknown",
                }));

                const nodes: GraphNode[] = (data.nodes ?? [])
                    .map((raw: any) => {
                        const baseNode: GraphNode = {
                            id: raw.name,
                            nodeType: raw.nodeType
                        };

                        switch (raw.nodeType) {
                            case NodeType.AUTHOR:
                                return {
                                    ...baseNode,
                                    nodeType: NodeType.AUTHOR,
                                    community: raw.community?.toString() ?? "",
                                    pagerank: raw.pagerank ?? 0,
                                    centrality: raw.centrality ?? 0
                                } as AuthorNode;

                            case NodeType.TWEET:
                                return {
                                    ...baseNode,
                                    nodeType: NodeType.TWEET,
                                    content: raw.content ?? "",
                                    authorName: raw.authorName ?? "",
                                    likesCount: raw.likesCount ?? 0,
                                    retweetsCount: raw.retweetsCount ?? 0,
                                    community: raw.community?.toString() ?? ""
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
                    })
                setProjectData({nodes, links});
            } catch (err) {
                showNotification("Unexpected error while fetching graph data.", BannerType.ERROR);
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
                graphRelationType,
                updateGraphType,
                focusedCommunityId,
                setFocusedCommunityId,
                selectedGraphType,
                setSelectedGraphType,
                showLabels,
                setShowLabels
            }}>
            {children}
        </ProjectContext.Provider>
    );
}
