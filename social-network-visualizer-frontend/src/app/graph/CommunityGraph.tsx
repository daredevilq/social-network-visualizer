"use client";

import {useEffect} from "react";
import {Link} from "@/app/interface/GraphData";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";
import dynamic from 'next/dynamic';
import {useNotification} from "@/app/context/NotificationProvider";
import {BannerType} from "@/app/components/Popups/Banner";
import {AuthorNode, GraphLink, GraphNode} from "@/types/GraphTypes";
import NodeColors from "../model/NodeColors";

const BaseGraph = dynamic(() => import('../model/BaseGraph'), {ssr: false});
export default function CommunityGraph() {
    const {
        loadedProjectName,
        loading,
        graphData,
        setGraphData,
        nodeFoundId,
        shortestPath,
        graphRelationType,
        focusedCommunityId,
    } = useProject();

    const NUMBER_OF_COMMUNITIES = 15;
    const {showNotification} = useNotification();

    useEffect(() => {
        if (!loadedProjectName) return;

        const fetchTopIds = fetch(
            `http://localhost:8080/community/top-ids?limit=${NUMBER_OF_COMMUNITIES}`
        )
            .then(res => {
                if (!res.ok) throw new Error(`top‑ids${res.status}`);
                return res.text();
            })
            .then(txt => {
                const parsed = JSON.parse(txt);
                return Array.isArray(parsed) ? parsed as number[] : [];
            });

        const fetchGraph = fetch(`http://localhost:8080/graph/${graphRelationType}`)
            .then(res => {
                if (!res.ok) throw new Error(`graph ${res.status}`);
                return res.json();
            });

        Promise.all([fetchTopIds, fetchGraph])
            .then(([topIds, data]) => {
                const idSet = new Set(topIds.map(id => id.toString()));

                const nodes: AuthorNode[] = (data.nodes ?? [])
                    .filter((raw: AuthorNode) => focusedCommunityId
                        ? raw.community?.toString() === focusedCommunityId
                        : idSet.has(raw.community?.toString())
                    )
                    .map((raw: AuthorNode) => ({
                        id: raw.id,
                        label: raw.id,
                        pagerank: raw.pagerank ?? 0,
                        degreeCentrality: raw.centrality ?? 0,
                        community: raw.community?.toString() ?? ""
                    }));

                const nodeNames = new Set(nodes.map((n: AuthorNode) => n.id));
                const links: Link[] = (data.edges ?? []).filter(
                    (l: any) => nodeNames.has(l.source) && nodeNames.has(l.target)
                );

                setGraphData({nodes, links});
            })
            .catch(err => {
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
                return authorNode.pagerank ? authorNode.pagerank * 7 : 10
            }}
            nodeLabel={(node: GraphNode) => `${node.id}` + ` || Community: ${node.community}`}
            nodeColor={node =>
                node.id === nodeFoundId ? NodeColors.getRedColor() : getNodeColor(node)
            }
            linkColor={(link: GraphLink) =>
                shortestPath.includes(link.source) && shortestPath.includes(link.target) ? NodeColors.getRedColor() : NodeColors.getWhiteColor()
            }
            linkWidth={(link: GraphLink) =>
                shortestPath.includes(link.source) && shortestPath.includes(link.target) ? 4 : 2
            }
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            nodeFoundId={nodeFoundId}
        />
    );
}
