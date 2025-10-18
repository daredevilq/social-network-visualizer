import {useEffect} from "react";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";

import dynamic from 'next/dynamic';
import {GraphLink, GraphNode} from "@/types/GraphTypes";
import nodeStrategy from "../model/strategies/NodeStrategy";
import NodeColors from "@/app/model/NodeColors";
import linkStrategy from "@/app/model/strategies/LinkStrategy";
import {useGraph} from "@/app/context/GraphContext";

const BaseGraph = dynamic(() => import('../model/BaseGraph'), {ssr: false});

export default function StandardGraph() {
    const {
        loadedProjectName,
        nodeFound,
        shortestPath,
        graphRelationType,
        fetchGraphData,
    } = useProject();
    const { graphData } = useGraph();

    useEffect(() => {
        if (!loadedProjectName) return;
        fetchGraphData().then(r => {
        });
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
                nodeVal={(node: GraphNode) => ((node as any).pagerank ? (node as any).pagerank * 5 : 1)}
                nodeLabel={(node: GraphNode) => `${node.id}`}
                nodeColor={(node: GraphNode) => {
                    if (node.id === nodeFound?.id && node.nodeType === nodeFound?.nodeType) return NodeColors.getRedColor();

                    if (shortestPath.includes(String(node.id))) {
                        return NodeColors.getGoldColor();
                    }
                    return nodeStrategy.getColor(node);
                }}
                linkColor={(link: GraphLink) => {
                    return shortestPath.includes(link.source) && shortestPath.includes(link.target) ? NodeColors.getRedColor() : linkStrategy.getColor(link);
                }}
                linkWidth={(link: GraphLink) =>
                    shortestPath.includes(link.source) && shortestPath.includes(link.target) ? 4 : 2
                }
                linkLabel={(link: GraphLink) => `${link.relation}`}
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                nodeFound={nodeFound}
            />
        </div>
    );
}

