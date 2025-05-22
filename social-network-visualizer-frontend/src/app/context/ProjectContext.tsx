'use client';

import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {API_BASE_URL} from "@/app/configuration/urlConfig";


interface Context {
    selected: string | null;
    loading: boolean;
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
    graphType: string;
    setGraphType: React.Dispatch<React.SetStateAction<string>>;
}

const ProjectContext = createContext<Context>({
    selected: null,
    loading: false,
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
    graphType: "mentions",
    setGraphType: () => {},
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
    const [graphType, setGraphType] = useState<string>("mentions");

    useEffect(() => {
        const stored = localStorage.getItem('selectedProject');
        if (stored) {
            setSelected(JSON.parse(stored));
        }

        const storedGraphType = localStorage.getItem('graphType');
        if (storedGraphType) {
            setGraphType(storedGraphType);
        }
    }, []);

    useEffect(() => {
        if (selected) {
            localStorage.setItem('selectedProject', JSON.stringify(selected));
        }

        if (graphType) {
            localStorage.setItem('graphType', graphType);
        }
    }, [selected, graphType]);

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
            await fetch(`${API_BASE_URL}/project/${name}/import?graphType=${graphType}`, {
                method: "POST",
            });
            setSelected(name);
            window.location.href = "/";
        });

    const refresh = async () =>
        runWithLoading(async () => {
            if (!selected) return;
            await fetch(`${API_BASE_URL}/project/${name}/import?graphType=${graphType}`, {
                method: "POST",
            });
        });

    return (
        <ProjectContext.Provider
            value={{
                selected,
                loading,
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
                graphType,
                setGraphType,
            }}>
            {children}
        </ProjectContext.Provider>
    );
}
