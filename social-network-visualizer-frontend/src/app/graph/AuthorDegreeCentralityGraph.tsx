import {useEffect, useState} from "react";
import BaseGraph from "../model/BaseGraph";
import {GraphData, Link, Node} from "@/app/interface/GraphData";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";

interface GraphProps {
    shortestPath: string[];
}

export default function AuthorPagerankGraph({shortestPath}: GraphData) {
    const [graphData, setGraphData] = useState<GraphData>({nodes: [], links: []});
    const {selected, loading} = useProject();

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
                setGraphData({nodes, links});
            })
            .catch((err) => console.error("Fetch error:", err));
    }, [selected, loading]);

    if (!selected)
        return (
            <div className="h-full flex flex-col items-center justify-center text-[#fafafa]">
                <FolderPlus className="w-12 h-12 mb-4 text-[#fafafa]/60" />
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
            nodeVal={(node: any) => (node.pagerank ? node.pagerank * 5 : 1)}
            nodeLabel={(node: any) =>
                `User: ${node.id}\nPR: ${node.pagerank?.toFixed(2)}\nComm: ${node.community}`
            }
            nodeColor={(node: any) => {
                const baseHue = 240;
                const degreeHue = node.pagerank * 80;
                const finalHue = baseHue + degreeHue;
                return `hsl(${finalHue}, 73%, 54%)`;
            }}
            linkColor={(link: any) =>
                shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? "red" : "#fafafa"
            }
            linkWidth={(link: any) =>
                shortestPath.includes(link.source.id) && shortestPath.includes(link.target.id) ? 3 : 2
            }
            linkDirectionalArrowLength={7}
            linkDirectionalArrowRelPos={1}
        />
    );
}

