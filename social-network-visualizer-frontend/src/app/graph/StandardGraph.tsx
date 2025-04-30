import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import { GraphData, Link, Node } from "@/app/interface/GraphData";
import RightSidebar from "@/app/component/RightSideBar";

interface GraphProps {
    shortestPath: string[];
}

export default function StandardGraph({shortestPath}: GraphProps) {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8080/graph/AUTHOR_MENTIONS")
            .then((res) => res.json())
            .then((data) => {
                console.log("PageRankGraph Fetched data:", data);
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
                setGraphData({ nodes, links });
            })
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    const handleNodeClick = (node: Node) => {
        setSelectedUserName(node.id);
        setIsSidebarOpen(true);
    };

    return (
        <div className="relative flex flex-col justify-center items-center h-screen w-full">
                <BaseGraph
                    graphData={graphData}
                    nodeVal={(node: any) => (node.pagerank ? node.pagerank * 5 : 1)}
                    nodeLabel={(node: any) =>
                        `User: ${node.id}\nPR: ${node.pagerank?.toFixed(2)}\nComm: ${node.community}`
                    }
                    nodeColor={(node: Node) => shortestPath.includes(node.id) ? "rgba(255, 159, 64, 0.95)" : 'rgba(92, 55, 230, 0.95)'}
                    linkColor={(link: any) =>
                        shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? "red" : "#fafafa"
                    }
                    linkWidth={(link: any) =>
                        shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 3 : 2
                    }
                    linkDirectionalArrowLength={6}
                    linkDirectionalArrowRelPos={1}
                    onNodeClick={handleNodeClick}
                />
                <RightSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    userName={selectedUserName}
                />
        </div>
    );
}

