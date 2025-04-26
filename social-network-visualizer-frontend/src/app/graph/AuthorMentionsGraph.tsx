import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import {GraphData, Link, Node} from "@/app/interface/GraphData";
import { useProject } from '@/app/context/ProjectContext';

interface GraphProps {
    shortestPath: string[];
}
export default function AuthorMentionsGraph({shortestPath}: GraphProps) {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const { selected, loading } = useProject();

    useEffect(() => {
        if (!selected || loading) return;

        fetch("http://localhost:8080/api/graph/author-mentions")
            .then((res) => res.json())
            .then((data) => {
                console.log("AuthorMentions Fetched data:", data);
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

    if (!selected)
        return <div className="h-full flex items-center justify-center text-[#fafafa]">
                 Wybierz projekt…
               </div>;
    
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


