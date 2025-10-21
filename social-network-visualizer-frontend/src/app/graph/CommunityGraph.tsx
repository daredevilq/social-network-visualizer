"use client";

import {useEffect} from "react";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from 'lucide-react';
import dynamic from 'next/dynamic';
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";
import {AuthorNode, GraphLink, GraphNode, NodeType} from "@/types/GraphTypes";
import NodeColors from "../model/NodeColors";
import {useGraph} from "@/app/context/GraphContext";
import {useWorkspace} from "@/app/context/WorkspaceContext";

const BaseGraph = dynamic(() => import('../model/BaseGraph'), {ssr: false});
export default function CommunityGraph() {
    const {
        loadedProjectName,
        loading,
        nodeFound,
        shortestPath,
        focusedCommunityId,
    } = useProject();
    const { isInWorkspaceMode } = useWorkspace();
    const { graphData, setGraphData } = useGraph();

    const NUMBER_OF_COMMUNITIES = 15;
    const {showNotification} = useNotification();

    useEffect(() => {
        if (!loadedProjectName || isInWorkspaceMode) return;

        const fetchTopIds = fetch(
            `http://localhost:8080/community/top-ids?limit=${NUMBER_OF_COMMUNITIES}`
        )
            .then(res => {
                if (!res.ok) throw new Error(`top‑ids${res.status}`);
                return res.text();
            })
            .then(txt => {
                const parsed = JSON.parse(txt);
                return Array.isArray(parsed) ? (parsed as number[]) : [];
            });

        Promise.all([fetchTopIds])
            .then(([topIds]) => {
                if (!graphData?.nodes?.length) {
                    showNotification("No graph graphData available.", BannerType.WARNING);
                    return;
                }

                const idSet = new Set(topIds.map((id) => id.toString()));

                const authorNodes = (graphData.nodes ?? []).filter(
                    (n: any) => n.nodeType === NodeType.AUTHOR
                ) as AuthorNode[];

                const authorNodesFromCommunity = authorNodes
                    .filter((node) =>
                        focusedCommunityId
                            ? node.community?.toString() === focusedCommunityId
                            : idSet.has(node.community?.toString())
                    )
                    .map((n) => ({
                        id: n.id,
                        nodeType: NodeType.AUTHOR,
                        community: n.community?.toString() ?? "",
                        pagerank: n.pagerank ?? 0,
                        centrality: n.centrality ?? 0,
                    })) satisfies AuthorNode[];

                const nodeIds = new Set(authorNodesFromCommunity.map((n) => n.id));

                const links: GraphLink[] = (graphData.links ?? []).filter(
                    (l: GraphLink) => nodeIds.has(l.source) && nodeIds.has(l.target)
                );

                const nodes: GraphNode[] = authorNodesFromCommunity.map((author) => ({
                    id: author.id,
                    nodeType: NodeType.AUTHOR,
                    community: author.community,
                    pagerank: author.pagerank,
                    centrality: author.centrality,
                }));

                setGraphData({nodes, links});
            })
            .catch((err) => {
                showNotification("Failed to load community graph data.", BannerType.ERROR);
            });
    }, [loadedProjectName, loading, focusedCommunityId]);

    const getNodeColor = (node: any) => {
        return `hsl(${(node.community * 55) % 360}, 90%, 50%)`;
    };

    if (!loadedProjectName)
        return (
            <div className="h-full flex flex-col items-center justify-center text-[#fafafa]">
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
        <BaseGraph
            graphData={graphData}
            nodeVal={(node: GraphNode) => {
                // TODO: Add a strategy pattern for node sizing depends on pagerank or other metrics in community graph
                const authorNode = node as AuthorNode;
                return Math.min(authorNode.pagerank ? authorNode.pagerank * 7 : 10, 30);
            }}
            nodeLabel={(node: GraphNode) => `${node.id}` + ` || Community: ${node.community}`}
            nodeColor={node => (node.id === nodeFound?.id && node.nodeType === nodeFound?.nodeType) ? NodeColors.getRedColor() : getNodeColor(node)}
            linkColor={(link: GraphLink) =>
                shortestPath.includes(link.source) && shortestPath.includes(link.target) ?
                    NodeColors.getRedColor() : NodeColors.getWhiteColor()
            }
            linkWidth={(link: GraphLink) =>
                shortestPath.includes(link.source) && shortestPath.includes(link.target) ? 4 : 2
            }
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            nodeFound={nodeFound}
        />
    );
}
