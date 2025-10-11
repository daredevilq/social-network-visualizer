"use client";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { API_BASE_URL } from "@/app/configuration/urlConfig";
import { GraphType } from "@/app/interface/GraphType";
import type { GraphQueryRequest } from "@/app/interface/graph/GraphQueryRequest";
import { Link, Node } from "@/app/interface/GraphData";
import {
    getGraphType,
    getGraphUiType,
    getProjectName,
    setGraphType,
    setProjectName,
} from "@/app/project-state";
import { useNotification } from "@/app/context/NotificationProvider";
import { BannerType } from "@/app/components/Popups/Banner";

interface Context {
    loadedProjectName: string | null;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    loadProject: (name: string, fetchData: boolean) => Promise<void>;
    runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
    fetchGraphData: (req?: GraphQueryRequest) => Promise<void>;
    selectedRelations: string[];
    setSelectedRelations: React.Dispatch<React.SetStateAction<string[]>>;
    isLabelsMode: true | false;
    setIsLabelsMode: React.Dispatch<React.SetStateAction<true | false>>;
    graphData: { nodes: any[]; links: any[] };
    setGraphData: React.Dispatch<React.SetStateAction<{ nodes: any[]; links: any[] }>>;
    nodeFoundId: string | null;
    setNodeIdFound: React.Dispatch<React.SetStateAction<string | null>>;
    shortestPath: string[];
    setShortestPath: React.Dispatch<React.SetStateAction<string[]>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedUserData: BasicUserData | null;
    setSelectedUserData: React.Dispatch<React.SetStateAction<BasicUserData | null>>;
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
    setLoading: () => {},
    loadProject: async () => {},
    runWithLoading: async (fn) => fn(),
    fetchGraphData: async () => {},
    selectedRelations: ["MENTIONS"],
    setSelectedRelations: () => {},
    isLabelsMode: true,
    setIsLabelsMode: () => {},
    graphData: { nodes: [], links: [] },
    setGraphData: () => {},
    nodeFoundId: null,
    setNodeIdFound: () => {},
    shortestPath: [],
    setShortestPath: () => {},
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    selectedUserData: null,
    setSelectedUserData: () => {},
    focusedCommunityId: undefined,
    setFocusedCommunityId: () => {},
    selectedGraphType: GraphType.STANDARD,
    setSelectedGraphType: () => {},
    showLabels: false,
    setShowLabels: () => {},
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState<string | null>(null);
    const [selectedUserData, setSelectedUserData] = useState<BasicUserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLabelsMode, setIsLabelsMode] = useState(false);
    const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({nodes: [], links: [],});
    const [nodeFoundId, setNodeIdFound] = useState<string | null>(null);
    const [shortestPath, setShortestPath] = useState<string[]>([]);
    const [selectedRelations, setSelectedRelations] = useState<string[]>(["MENTIONS",]);
    const [focusedCommunityId, setFocusedCommunityId] = useState<
        string | undefined
    >();
    const [selectedGraphType, setSelectedGraphType] = useState<GraphType>(
        GraphType.STANDARD
    );
    const [showLabels, setShowLabels] = useState(false);
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
                const res = await fetch(
                    `${API_BASE_URL}/project/${name}/import`,
                    {
                        method: "POST",
                    }
                );

                if (!res.ok) {
                    const errorText = await res.text();
                    let errorMessage = `Failed to import project: ${res.statusText}`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.error) errorMessage = errorJson.error;
                    } catch {}
                    throw new Error(errorMessage);
                }

                setLoadedProjectName(name);
                await setProjectName(name);

                showNotification(
                    `Project "${name}" loaded successfully.`,
                    BannerType.SUCCESS
                );

                if (fetchData) await fetchGraphData();
            } catch (err: any) {
                console.error("Error loading project:", err);
                showNotification(
                    err.message || `Error loading project "${name}".`,
                    BannerType.ERROR
                );
            }
        });
    };

    const fetchGraphData = async (req?: GraphQueryRequest) =>
        runWithLoading(async () => {
            if (!loadedProjectName) return;
            try {
                const body: GraphQueryRequest = req ?? {
                    projectName: loadedProjectName,
                    relationTypes: selectedRelations,
                    communityId: focusedCommunityId
                        ? Number(focusedCommunityId)
                        : null,
                    nodeLabels: null, // for now its null, hopefully after Wiktor's update we will use it
                };

                const res = await fetch(`${API_BASE_URL}/graph/data`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    let errorMessage = `Failed to fetch graph data: ${res.status} ${res.statusText}`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.error) errorMessage = errorJson.error;
                    } catch {}
                    console.error("Graph fetch error:", errorMessage);
                    showNotification(errorMessage, BannerType.ERROR);
                    return;
                }

                let data: any;
                try {
                    data = await res.json();
                } catch (parseErr) {
                    console.error("JSON parse error:", parseErr);
                    showNotification(
                        "Invalid response format from server.",
                        BannerType.ERROR
                    );
                    return;
                }

                if (
                    !Array.isArray(data?.nodes) ||
                    !Array.isArray(data?.edges)
                ) {
                    console.error("Invalid graph data structure:", data);
                    showNotification(
                        "Graph data format is invalid.",
                        BannerType.ERROR
                    );
                    return;
                }

                const links: Link[] = data.edges.map((edge: any) => ({
                    source: edge.source,
                    target: edge.target,
                    type: edge.relation ?? edge.type ?? "unknown",
                }));

                const nodes: Node[] = data.nodes.map((node: any) => ({
                    id: node.name,
                    label: node.name,
                    pagerank: node.pagerank ?? 0,
                    degreeCentrality: node.centrality ?? 0,
                    community: node.community?.toString() ?? "",
                }));

                setGraphData({ nodes, links });
            } catch (err: any) {
                console.error("Unexpected error fetching graph:", err);
                showNotification(
                    err.message || "Unexpected error while fetching graph data.",
                    BannerType.ERROR
                );
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
                selectedRelations,
                setSelectedRelations,
                isLabelsMode,
                setIsLabelsMode,
                graphData,
                setGraphData,
                nodeFoundId,
                setNodeIdFound,
                shortestPath,
                setShortestPath,
                isSidebarOpen,
                setIsSidebarOpen,
                selectedUserData,
                setSelectedUserData,
                focusedCommunityId,
                setFocusedCommunityId,
                selectedGraphType,
                setSelectedGraphType,
                showLabels,
                setShowLabels,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}
