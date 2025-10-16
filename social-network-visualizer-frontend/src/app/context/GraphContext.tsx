'use client'
import React, {createContext, useContext, useEffect, useState} from "react";
import { GraphLink, GraphNode } from "@/types/GraphTypes";
import {useNotification} from "@/app/context/NotificationProvider";
import {useProject} from "@/app/context/ProjectContext";
import {useWorkspace} from "@/app/context/WorkspaceContext";
import {BannerType} from "@/app/components/Popups/Banner";
import LeaveConfirmModal from "@/app/components/Popups/LeaveConfirmModal";

interface GraphContextType {
    graphData: { nodes: GraphNode[]; links: GraphLink[] };
    setGraphData: React.Dispatch<React.SetStateAction<{ nodes: GraphNode[]; links: GraphLink[] }>>;
    resetGraphData: () => void;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
    setIsConfirmModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    runWithUnsavedCheck: <T>(fn: () => Promise<T>) => Promise<void>;
}

const GraphContext = createContext<GraphContextType>({
    graphData: { nodes: [], links: [] },
    setGraphData: () => {},
    resetGraphData: () => {},
    hasUnsavedChanges: false,
    setHasUnsavedChanges: () => {},
    setIsConfirmModalOpen: () => {},
    runWithUnsavedCheck: async (fn) => {return},
});

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({nodes: [], links: []});
    const { showNotification } = useNotification();
    const { projectData } = useProject();
    const { isInWorkspaceMode, workspaceData, saveWorkspaceData, setIsInWorkspaceMode, setOpenedWorkspaceName, setWorkspaceData } = useWorkspace();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | undefined>(undefined);

    useEffect(() => {
        setGraphData(isInWorkspaceMode ? workspaceData : projectData);
    }, [isInWorkspaceMode, projectData, workspaceData]);``

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

    const resetGraphData = async () => {
        setGraphData(isInWorkspaceMode ? workspaceData : projectData);
        setHasUnsavedChanges(false);
        showNotification("Graph has been reset.", BannerType.INFO);
    };

    const runWithUnsavedCheck = async <T, >(fn: () => Promise<T>): Promise<void> => {
        if (hasUnsavedChanges) {
            setPendingAction(() => fn);
            setIsConfirmModalOpen(true);
            return;
        }

        await fn();
    };

    const handleSave = async () => {
        await saveWorkspaceData(graphData);
        if (pendingAction) {
            await pendingAction();
            setPendingAction(undefined);
        }
        setHasUnsavedChanges(false);
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
        <GraphContext.Provider
            value={{
                graphData,
                setGraphData,
                resetGraphData,
                hasUnsavedChanges,
                setHasUnsavedChanges,
                setIsConfirmModalOpen,
                runWithUnsavedCheck
            }}
        >
            {children}

            <LeaveConfirmModal
                open={isConfirmModalOpen}
                onSave={handleSave}
                onDiscard={handleDiscard}
                onCancel={handleCancel}
            />
        </GraphContext.Provider>
    );
};

export const useGraph = () => useContext(GraphContext);


