'use client'
import React, {createContext, useContext, useEffect, useState} from "react";
import { GraphLink, GraphNode } from "@/types/GraphTypes";
import {useNotification} from "@/app/context/NotificationProvider";
import {useProject} from "@/app/context/ProjectContext";
import {useWorkspace} from "@/app/context/WorkspaceContext";
import {BannerType} from "@/app/components/Popups/Banner";

interface GraphContextType {
    graphData: { nodes: GraphNode[]; links: GraphLink[] };
    setGraphData: React.Dispatch<React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>>;
    resetGraphData: () => void;
}

const GraphContext = createContext<GraphContextType>({
    graphData: { nodes: [], links: [] },
    setGraphData: () => {},
    resetGraphData: () => {},
});

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({nodes: [], links: []});
    const { showNotification } = useNotification();
    const { projectData } = useProject();
    const { isInWorkspaceMode, workspaceData, setHasUnsavedChanges } = useWorkspace();

    useEffect(() => {
        setGraphData(isInWorkspaceMode ? workspaceData : projectData);
    }, [isInWorkspaceMode, projectData, workspaceData]);``

    const resetGraphData = async () => {
        setGraphData(isInWorkspaceMode ? workspaceData : projectData);
        setHasUnsavedChanges(false);
        showNotification("Graph has been reset.", BannerType.INFO);
    };

    return (
        <GraphContext.Provider
            value={{
                graphData,
                setGraphData,
                resetGraphData,
            }}
        >
            {children}
        </GraphContext.Provider>
    );
};

export const useGraph = () => useContext(GraphContext);


