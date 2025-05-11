import {useEffect} from "react";
import {Link, Node} from "@/app/interface/GraphData";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";

import dynamic from 'next/dynamic';

const BaseGraph = dynamic(() => import('../model/BaseGraph'), {ssr: false});

export default function StandardGraph() {
    const {
        selected,
        loading,
        graphData,
        setGraphData,
        nodeFoundId,
        shortestPath,
    } = useProject();

    useEffect(() => {
        if (!selected || loading) return;
        fetch("http://localhost:8080/graph/AUTHOR_MENTIONS")
            .then((res) => res.json())
            .then((data) => {
                if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
                    console.error("Invalid data format:", data);
                    return;
                }
                const links: Link[] = data.edges.map(link => ({
                    ...link,
                    type: link.source === link.target ? "mention" : "retweet",
                }));
                const nodes: Node[] = data.nodes.map((node: any) => ({
                    id: node.name,
                    label: node.name,
                    pagerank: node.pagerank ?? 0,
                    degreeCentrality: node.centrality ?? 0,
                    community: node.community?.toString() ?? ""
                }));
                setGraphData({nodes, links});
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [selected, loading]);

    if (!selected)
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
                nodeLabel={(node: any) =>
                    `User: ${node.id}\nPR: ${node.pagerank?.toFixed(2)}\nComm: ${node.community}`
                }
                nodeColor={node => {
                    if (node.id === nodeFoundId) return "red";
                    return shortestPath.includes(node.id)
                        ? "rgba(255, 159, 64, 0.95)"
                        : "rgba(92, 55, 230, 0.95)";
                }}
                linkColor={link => {
                    return shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? "red" : "#fafafa";
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

