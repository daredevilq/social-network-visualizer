"use client";

import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import { GraphData, Link, Node } from "@/app/interface/GraphData";
import { useProject } from '@/app/context/ProjectContext';

interface GraphProps {
    shortestPath: string[];
}

export default function CommunityGraph({shortestPath}: GraphProps) {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const { selected, loading} = useProject();

    useEffect(() => {
        if (!selected || loading) return;

        fetch("http://localhost:8080/api/graph/author-mentions")
            .then((res) => res.json())
            .then((data) => {
                if (!data.nodes || !Array.isArray(data.nodes) || !data.links || !Array.isArray(data.links)) {
                    console.error("Invalid data format:", data);
                    return;
                }
                const nodes: Node[] = data.nodes.map((node: Node) => ({
                    ...node,
                    size: node.pagerank ? node.pagerank * 20 : 5
                }));

                const links: Link[] = data.links.map((link) => ({ ...link }));

                setGraphData({ nodes, links });
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [selected, loading]);

    const getNodeColor = (node: any) => {
        return `hsl(${(node.community * 55) % 360}, 90%, 50%)`;
    };

    if (!selected)
        return <div className="h-full flex items-center justify-center text-[#fafafa]">
                 Wybierz projekt…
               </div>;

    return (
        <BaseGraph
            graphData={graphData}
            nodeVal={(node: any) => node.pagerank ? node.pagerank * 7 : 10}
            nodeLabel={(node: any) =>
                `User: ${node.id}\n` +
                `PageRank: ${node.pagerank?.toFixed(3) ?? 0}\n` +
                `Community: ${node.community}`
            }
            nodeColor={getNodeColor}
            linkColor={(link: any) =>
                shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? "red" : "#fafafa"
            }
            linkWidth={(link: any) =>
                shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 3 : 2
            }
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
        />
    );
}
