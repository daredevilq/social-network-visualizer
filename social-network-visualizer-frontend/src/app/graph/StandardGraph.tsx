import {useEffect, useState} from "react";
import BaseGraph from "../model/BaseGraph";
import {Link, Node} from "@/app/interface/GraphData";
import RightSidebar from "@/app/components/RightSideBar";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";

export default function StandardGraph() {
    const graphLimit = 10;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
    const {selected, loading, graphData, setGraphData, nodeFoundId, shortestPath} = useProject();
    const [highlightNodeIds, setHighlightNodeIds] = useState<Set<string>>(new Set());
    const [highlightLinkKeys, setHighlightLinkKeys] = useState<Set<string>>(new Set());

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

                const topNodes = nodes
                    .sort((a, b) => b.pagerank - a.pagerank)
                    .slice(0, graphLimit);
                const nodeIdsSet = new Set(topNodes.map(n => n.id));
                setHighlightNodeIds(nodeIdsSet);

                const topLinkKeys = links
                    .filter(l => nodeIdsSet.has(l.source) && nodeIdsSet.has(l.target))
                    .map(l => `${l.source}___${l.target}`);
                setHighlightLinkKeys(new Set(topLinkKeys));
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [selected, loading]);

    const addNodeToGraph = () => {
        setGraphData(prev => {
            const newId = `generated_node_${prev.nodes.length}`;
            const targetId = highlightNodeIds.values().next().value || null;

            const newNode: Node = {
                id: newId,
                pagerank: Math.random() * 0.05,
                degreeCentrality: Math.floor(Math.random() * 50),
                community: "new"
            };

            const newLink: { source: string | intrinsic; target: string; relation: string } | null = targetId
                ? {
                    source: targetId,
                    target: newId,
                    relation: "generated"
                }
                : null;

            return {
                nodes: [...prev.nodes, newNode],
                links: newLink ? [...prev.links, newLink] : [...prev.links]
            };
        });
    };


    let clickTimeout: NodeJS.Timeout | null = null;
    const handleNodeClick = (node: Node) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            handleDoubleClick(node);
            return;
        }
        clickTimeout = setTimeout(() => {
            clickTimeout = null;
            handleSingleNodeClick(node);
        }, 300);
    }

    const handleSingleNodeClick = (node: Node) => {
        setSelectedUserName(node.id);
        setIsSidebarOpen(true);
    };
    const handleDoubleClick = (node: Node) => {
        const newNodes = [];
        const newLinks = [];

        for (let i = 0; i < 10; i++) {
            const newNodeId = `${node.id}_child_${i}`;
            newNodes.push({
                id: newNodeId,
                name: `Auto_${newNodeId}`,
                pagerank: Math.random() * 0.1,
                centrality: Math.floor(Math.random() * 100),
                community: node.community,
            });
            newLinks.push({
                source: node.id,
                target: newNodeId,
                relation: "generated",
            });
        }


        setGraphData((prev) => ({
            nodes: [...prev.nodes, ...newNodes],
            links: [...prev.links, ...newLinks],
        }));
    }

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
                    return "rgba(92, 55, 230, 0.95)";
                    if (highlightNodeIds.has(node.id)) {
                        if (node.id === nodeFoundId) return "red";
                        return shortestPath.includes(node.id)
                            ? "rgba(255, 159, 64, 0.95)"
                            : "rgba(92, 55, 230, 0.95)";
                    } else {
                        return "#1B1B25";
                    }
                }}
                linkColor={link => {
                    return "#fafafa";
                    const key = `${link.source.id}___${link.target.id}`;
                    if (highlightLinkKeys.has(key)) {
                        return shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? "red" : "#fafafa";
                    } else {
                        return "#1B1B25";
                    }
                }}
                linkWidth={(link: any) =>
                    shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 4 : 2
                }
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
            />
            <button
                className="absolute top-4 left-4 z-10 bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-100 transition"
                onClick={addNodeToGraph}
            >
                ➕ Dodaj node
            </button>
            <RightSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userName={selectedUserName}
            />
        </div>
    );
}

