import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import { GraphData, Link, Node } from "@/app/interface/GraphData";
import RightSidebar from "@/app/components/RightSideBar";
import { useProject } from '@/app/context/ProjectContext';

interface GraphProps {
    shortestPath: string[];
}

export default function StandardGraph({shortestPath}: GraphProps) {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
    const { selected, loading} = useProject();

    useEffect(() => {
        if (!selected || loading) return;

        fetch("http://localhost:8080/api/graph/author-mentions")
            .then((res) => res.json())
            .then((data) => {
                console.log("PageRankGraph Fetched data:", data);
                if (!data.nodes || !Array.isArray(data.nodes) || !data.links || !Array.isArray(data.links)) {
                    console.error("Invalid data format:", data);
                    return;
                }
                const links: Link[] = data.links.map(link => ({
                    ...link,
                    type: link.source === link.target ? "mention" : "retweet",
                }));
                const nodes: Node[] = data.nodes.map((node: Node) => ({
                    ...node,
                    degreeCentrality: node.degreeCentrality ? node.degreeCentrality * 5 : 1,
                }));
                setGraphData({ nodes, links });
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [selected, loading]);

    const handleNodeClick = (node: Node) => {
        setSelectedUserName(node.id);
        setIsSidebarOpen(true);
    };

    if (!selected)
        return <div className="h-full flex items-center justify-center text-[#fafafa]">
                 Wybierz projekt…
               </div>;

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

