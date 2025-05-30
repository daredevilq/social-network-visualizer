'use client';

import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {API_BASE_URL} from "@/app/configuration/urlConfig";
import {GraphType} from "@/app/interface/GraphType";
import {Link, Node} from "@/app/interface/GraphData";


interface Context {
    selected: string | null;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    select: (name: string) => Promise<void>;
    runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
    refresh: (name: string) => Promise<void>;
    fetchGraphData: () => Promise<void>;
    isLabelsMode: true | false;
    setIsLabelsMode: React.Dispatch<React.SetStateAction<true | false>>;
    graphData: {nodes: any[], links: any[]};
    setGraphData: React.Dispatch<React.SetStateAction<{nodes: any[], links: any[]}>>;
    nodeFoundId: string | null;
    setNodeIdFound: React.Dispatch<React.SetStateAction<string | null>>;
    shortestPath: string[];
    setShortestPath: React.Dispatch<React.SetStateAction<string[]>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedUserData: BasicUserData | null;
    setSelectedUserData: React.Dispatch<React.SetStateAction<BasicUserData | null>>;
    graphRelationType: string;
    setGraphRelationType: React.Dispatch<React.SetStateAction<string>>;
    focusedCommunityId?: string;
    setFocusedCommunityId: (id?: string) => void;
    selectedGraphType: GraphType;
    setSelectedGraphType: (g: GraphType) => void;
    showLabels: boolean;
    setShowLabels: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectContext = createContext<Context>({
    selected: null,
    loading: false,
    setLoading: () => {},
    select: async () => {},
    runWithLoading: async (fn) => fn(),
    refresh: async () => {},
    fetchGraphData: async () => {},
    isLabelsMode: true,
    setIsLabelsMode: () => {},
    graphData: {nodes: [], links: []},
    setGraphData: () => {},
    nodeFoundId: null,
    setNodeIdFound: () => {},
    shortestPath: [],
    setShortestPath: () => {},
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    selectedUserData: null,
    setSelectedUserData: () => {},
    graphRelationType: "mentions",
    setGraphRelationType: () => {},
    focusedCommunityId: undefined,
    setFocusedCommunityId: () => {},
    selectedGraphType: GraphType.STANDARD,
    setSelectedGraphType: () => {},
    showLabels: false,
    setShowLabels: () => {},

});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({children}: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [selectedUserData, setSelectedUserData] = useState<BasicUserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLabelsMode, setIsLabelsMode] = useState(false);
    const [graphData, setGraphData] = useState<{nodes: any[], links: any[]}>({nodes: [], links: []});
    const [nodeFoundId, setNodeIdFound] = useState<string | null>(null);
    const [shortestPath, setShortestPath] = useState<string[]>([]);
    const [graphRelationType, setGraphRelationType] = useState<string>("mentions");
    const [focusedCommunityId, setFocusedCommunityId] = useState<string | undefined>();
    const [selectedGraphType, setSelectedGraphType] = useState<GraphType>(GraphType.STANDARD);
    const [showLabels, setShowLabels] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('selectedProject');
        if (stored) {
            setSelected(JSON.parse(stored));
        }

        const storedGraphType = localStorage.getItem('graphType');
        if (storedGraphType) {
            setGraphRelationType(storedGraphType);
        }
    }, []);

    useEffect(() => {
        if (selected) {
            localStorage.setItem('selectedProject', JSON.stringify(selected));
        }

        if (graphRelationType) {
            localStorage.setItem('graphType', graphRelationType);
        }
    }, [selected, graphRelationType]);

    useEffect(() => {
        const stored = localStorage.getItem('graphUiType');
        if (stored && Object.values<string>(GraphType).includes(stored))
            setSelectedGraphType(stored as GraphType);
    }, []);

    useEffect(() => {
        localStorage.setItem('graphUiType', selectedGraphType);
    }, [selectedGraphType]);


    const runWithLoading = async <T, >(fn: () => Promise<T>): Promise<T> => {
        if (loading) return fn();
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    };

    const select = async (name: string) =>
        runWithLoading(async () => {
            if (selected === name) return;
            await fetch(`${API_BASE_URL}/project/${name}/import?graphType=${graphRelationType}`, {
                method: "POST",
            });
            setSelected(name);
            window.location.href = "/";
        });

    const refresh = async () =>
        runWithLoading(async () => {
            if (!selected) return;
            await fetch(`${API_BASE_URL}/project/${name}/import?graph-type=${graphRelationType}`, {
                method: "POST",
            });
        });

    const fetchGraphData = async () =>
        runWithLoading(async () => {
            if (!selected) return;

            try {
                const res = await fetch(`http://localhost:8080/graph/${graphRelationType}`);

                if (!res.ok) {
                    console.error("Fetch failed:", res.statusText);
                    return;
                }

                const data = await res.json();

                if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges)) {
                    console.error("Invalid data format:", data);
                    return;
                }

                const links: Link[] = data.edges.map((edge: any) => ({
                    source: edge.source,
                    target: edge.target,
                    relation: edge.relation ?? "unknown",
                }));

                const nodes: Node[] = data.nodes.map((node: any) => ({
                    id: node.name,
                    label: node.name,
                    pagerank: node.pagerank ?? 0,
                    degreeCentrality: node.centrality ?? 0,
                    community: node.community?.toString() ?? "",
                }));

                setGraphData({ nodes, links });
            } catch (err) {
                console.error("Fetch error:", err);
            }
        });


    return (
        <ProjectContext.Provider
            value={{
                selected,
                loading,
                setLoading,
                select,
                runWithLoading,
                refresh,
                fetchGraphData,
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
                graphRelationType,
                setGraphRelationType,
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
