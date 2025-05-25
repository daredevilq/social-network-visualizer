'use client';

import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {API_BASE_URL} from "@/app/configuration/urlConfig";
import {GraphType} from "@/app/interface/GraphType";


interface Context {
    selected: string | null;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    select: (name: string) => Promise<void>;
    runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
    refresh: () => Promise<void>;
    isGraphMode: true | false;
    setIsGraphMode: React.Dispatch<React.SetStateAction<true | false>>;
    graphData: {nodes: any[], links: any[]};
    setGraphData: React.Dispatch<React.SetStateAction<{nodes: any[], links: any[]}>>;
    nodeFoundId: string | null;
    setNodeIdFound: React.Dispatch<React.SetStateAction<string | null>>;
    shortestPath: string[];
    setShortestPath: React.Dispatch<React.SetStateAction<string[]>>;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedUserName: string | null;
    setSelectedUserName: React.Dispatch<React.SetStateAction<string | null>>;
    graphRelationType: string;
    setGraphRelationType: React.Dispatch<React.SetStateAction<string>>;
    focusedCommunityId?: string;
    setFocusedCommunityId: (id?: string) => void;
    selectedGraphType: GraphType;
    setSelectedGraphType: (g: GraphType) => void;
}

const ProjectContext = createContext<Context>({
    selected: null,
    loading: false,
    setLoading: () => {},
    select: async () => {},
    runWithLoading: async (fn) => fn(),
    refresh: async () => {},
    isGraphMode: true,
    setIsGraphMode: () => {},
    graphData: {nodes: [], links: []},
    setGraphData: () => {},
    nodeFoundId: null,
    setNodeIdFound: () => {},
    shortestPath: [],
    setShortestPath: () => {},
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    selectedUserName: null,
    setSelectedUserName: () => {},
    graphRelationType: "mentions",
    setGraphRelationType: () => {},
    focusedCommunityId: undefined,
    setFocusedCommunityId: () => {},
    selectedGraphType: GraphType.STANDARD,
    setSelectedGraphType: () => {},

});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({children}: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isGraphMode, setIsGraphMode] = useState(true);
    const [graphData, setGraphData] = useState<{nodes: any[], links: any[]}>({nodes: [], links: []});
    const [nodeFoundId, setNodeIdFound] = useState<string | null>(null);
    const [shortestPath, setShortestPath] = useState<string[]>([]);
    const [graphRelationType, setGraphRelationType] = useState<string>("mentions");
    const [focusedCommunityId, setFocusedCommunityId] = useState<string | undefined>();
    const [selectedGraphType, setSelectedGraphType] = useState<GraphType>(GraphType.STANDARD);

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
            await fetch(`${API_BASE_URL}/project/${name}/import?graphType=${graphRelationType}`, {
                method: "POST",
            });
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
                isGraphMode,
                setIsGraphMode,
                graphData,
                setGraphData,
                nodeFoundId,
                setNodeIdFound,
                shortestPath,
                setShortestPath,
                isSidebarOpen,
                setIsSidebarOpen,
                selectedUserName,
                setSelectedUserName,
                graphRelationType,
                setGraphRelationType,
                focusedCommunityId,
                setFocusedCommunityId,
                selectedGraphType,
                setSelectedGraphType
            }}>
            {children}
        </ProjectContext.Provider>
    );
}
