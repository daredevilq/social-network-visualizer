import {useEffect, useState} from "react";
import BaseGraph from "../model/BaseGraph";
import {GraphData, Link, Node} from "@/app/interface/GraphData";
import {useProject} from '@/app/context/ProjectContext';
import {FolderPlus} from "lucide-react";

interface GraphProps {
    shortestPath: string[];
}

export default function AuthorMentionsGraph({shortestPath}: GraphProps) {
    const [graphData, setGraphData] = useState<GraphData>({nodes: [], links: []});
    const {selected, loading} = useProject();

    useEffect(() => {
        if (!selected || loading) return;

        fetch("http://localhost:8080/graph/AUTHOR_MENTIONS")
            .then((res) => res.json())
            .then((data) => {
                console.log("AuthorMentions Fetched data:", data);
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
            nodeVal={(node: any) => (node.degreeCentrality ? node.degreeCentrality : 0)}
            nodeLabel={(node: any) => `User: ${node.id}\nDC: ${node.degreeCentrality}`}
            nodeColor={(node: any) => `hsl(${node.degreeCentrality * 40}, 100%, 50%)`}
            linkColor={(link: any) => (link.type === "mention" ? "red" : "#fafafa")}
            linkWidth={(link: any) => (link.type === "mention" ? 1 : 2)}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
        />
    );
}


