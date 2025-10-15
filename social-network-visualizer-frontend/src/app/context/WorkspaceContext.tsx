'use client'
import React, {createContext, useContext, useEffect, useState} from "react";
import {BannerType} from "@/app/components/Popups/Banner";
import {AuthorNode, GraphLink, GraphNode, HashtagNode, NodeType, TweetNode} from "@/types/GraphTypes";
import {useNotification} from "@/app/context/NotificationProvider";
import {useProject} from "@/app/context/ProjectContext";

interface WorkspaceContextType {
    isInWorkspaceMode: boolean;
    setIsInWorkspaceMode: (value: boolean) => void;
    openedWorkspaceName: string | null;
    setOpenedWorkspaceName: (workspace: string | null) => void;
    workspaceData: { nodes: GraphNode[]; links: GraphLink[] };
    setWorkspaceData: React.Dispatch<
        React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>
    >;
    fetchWorkspaceData: (workspaceName: string) => Promise<void>;
    saveWorkspaceData: (graphData: { nodes: GraphNode[], links: GraphLink[] }) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
    isInWorkspaceMode: false,
    setIsInWorkspaceMode: () => {},
    openedWorkspaceName: null,
    setOpenedWorkspaceName: () => {},
    workspaceData: { nodes: [], links: [] },
    setWorkspaceData: () => {},
    fetchWorkspaceData: async (workspaceName: string) => {},
    saveWorkspaceData: async (graphData: { nodes: GraphNode[], links: GraphLink[] }) => {},
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInWorkspaceMode, setIsInWorkspaceMode] = useState<boolean>(false);
    const [openedWorkspaceName, setOpenedWorkspaceName] = useState<string | null>(null);
    const [workspaceData, setWorkspaceData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({nodes: [], links: []});
    const { showNotification } = useNotification();
    const { runWithLoading, loadedProjectName } = useProject();

    useEffect(() => {
        fetchWorkspaceData();
    }, [openedWorkspaceName]);

    const fetchWorkspaceData = async () =>
        runWithLoading(async () => {
            if (!openedWorkspaceName || !loadedProjectName) return;
            try {
                const res = await fetch(`http://localhost:8080/project/${loadedProjectName}/workspace/${openedWorkspaceName}/load`);

                if (!res.ok) {
                    const message = `Failed to fetch workspace data: ${res.status} ${res.statusText}`;
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
                    showNotification("Workspace data format is invalid.", BannerType.ERROR);
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
                            id: raw.id,
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
                setWorkspaceData({nodes, links});
                setIsInWorkspaceMode(true);
                showNotification(`Workspace "${openedWorkspaceName}" loaded successfully.`, BannerType.SUCCESS);
            } catch (err: any) {
                showNotification(`Load error: ${err.message}`, BannerType.ERROR);
            }
        });

    const saveWorkspaceData = async (graphData: { nodes: GraphNode[], links: GraphLink[] }) =>
        runWithLoading(async () => {
            if (!openedWorkspaceName || !loadedProjectName) return;
            try {
                const res = await fetch(`http://localhost:8080/project/${loadedProjectName}/workspace`, {
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
                showNotification("Unexpected error while saving workspace data.", BannerType.ERROR);
            }
        });

    return (
        <WorkspaceContext.Provider
            value={{
                isInWorkspaceMode,
                setIsInWorkspaceMode,
                openedWorkspaceName,
                setOpenedWorkspaceName,
                workspaceData,
                setWorkspaceData,
                fetchWorkspaceData,
                saveWorkspaceData,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => useContext(WorkspaceContext);


