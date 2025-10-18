"use client";

import {useWorkspace} from "@/app/context/WorkspaceContext";
import {useGraph} from "@/app/context/GraphContext";

export const useSaveWorkspaceChanges = () => {
    const { saveWorkspaceData } = useWorkspace();
    const { graphData } = useGraph();

    const saveCurrentGraphData = async () => {
        await saveWorkspaceData(graphData);
    };

    return { saveCurrentGraphData };
};
