import {useEffect} from "react";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";

import dynamic from 'next/dynamic';

const BaseGraph = dynamic(() => import('../model/BaseGraph'), {ssr: false});

export default function StandardGraph() {
    const {
        loadedProjectName,
        loading,
        graphData,
        nodeFoundId,
        shortestPath,
        graphRelationType,
        fetchGraphData,
    } = useProject();

    useEffect(() => {
        if (!loadedProjectName || loading) return;
        fetchGraphData();
    }, [loadedProjectName, graphRelationType]);

    if (!loadedProjectName)
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-[#fafafa]">
                <FolderPlus className="w-12 h-12 mb-4 text-[#fafafa]/60"/>
                <p className="text-lg font-medium text-[#fafafa]/80">
                    Select a project to get started
                </p>
                <p className="text-sm text-[#fafafa]/50 mt-1">
                    Use the sidebar to pick one
                </p>
            </div>
        );

    return (
        <div className="relative flex flex-col justify-center items-center h-screen w-full">
            <BaseGraph
                graphData={graphData}
                nodeVal={(node: any) => (node.pagerank ? node.pagerank * 5 : 1)}
                nodeLabel={(node: any) => `${node.id}`}
                nodeColor={node => {
                    if (node.id === nodeFoundId) return "red";
                    return shortestPath.includes(String(node.id))
                        ? "rgba(255, 159, 64, 0.95)"
                        : "rgba(92, 55, 230, 0.95)";
                }}
                linkColor={link => {
                    return shortestPath.includes(String(link.source)) && shortestPath.includes(String(link.target)) ? "red" : "#fafafa";
                }}
                linkWidth={(link: any) =>
                    shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 4 : 2
                }
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                nodeFoundId={nodeFoundId}
            />
        </div>
    );
}

