import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import { GraphData, Link, Node } from "@/app/interface/GraphData";
import RightSidebar from "@/app/component/RightSideBar";


export default function StandardGraph() {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [shortestPath, setShortestPath] = useState<string[]>([]);
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

    useEffect(() => {
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
    }, []);

    const handleSearch = () => {
        if (!source || !target) {
            setShortestPath([]);
            return;
        }

        setIsLoading(true);

        fetch(`http://localhost:8080/author/shortestPath/${source}?target=${target}`)
            .then((res) => res.json())
            .then((data) => {
                setShortestPath(data);
            })
            .catch((err) => console.error("Fetch error:", err))
            .finally(() => setIsLoading(false));
    };

    const handleNodeClick = (node: Node) => {
        setSelectedUserName(node.id);
        setIsSidebarOpen(true);
    };

    return (
        <div className="relative flex flex-col justify-center items-center h-screen w-full">
            <div className="absolute top-10 w-2/5 min-w-[300px] z-10 p-5 bg-transparent backdrop-blur-lg border border-white/30 bg-black/50 rounded-md">
                <h3 className="text-xl text-center font-medium">
                    Choose source and target to display the shortest path by mentions parameter
                </h3>
                <div className="flex gap-4 items-center justify-center">
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="RealMadrid"
                        className="px-3 py-2 rounded-md border border-white/30 bg-black/20 text-white w-full min-w-[120px]"
                    />
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="FIFACWC"
                        className="px-3 py-2 rounded-md border border-white/30 bg-black/20 text-white w-full min-w-[120px]"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="h-10 w-90 px-6 py-2 rounded-md bg-transparent border-2 border-white/30 text-white cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:border-white/50"
                    >
                        {isLoading ? "Loading..." : "Show path"}
                    </button>
                </div>
                <h5 className="text-sm text-center opacity-80">
                    Display without source and target to display standard graph
                </h5>
            </div>

            <div className="h-full w-full mt-[15vh]">
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
        </div>
    );
}

