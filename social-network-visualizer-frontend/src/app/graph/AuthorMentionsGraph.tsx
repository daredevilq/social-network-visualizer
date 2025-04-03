import { useEffect, useState } from "react";
import BaseGraph from "./BaseGraph";
import GraphData from "@/app/interface/GraphData"; // Importujemy nasz komponent bazowy

export default function AuthorMentionsGraph() {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

    useEffect(() => {
        fetch("http://localhost:8080/api/graph/author-mentions")
            .then((res) => res.json())
            .then((data) => {
                const links = data.links.map((link: any) => ({
                    ...link,
                    type: link.source === link.target ? "mention" : "retweet",
                }));
                setGraphData({ nodes: data.nodes, links });
            })
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    return (
        <BaseGraph
            graphData={graphData}
            nodeVal={(node: any) => (node.degreeCentrality ? node.degreeCentrality : 0)}
            nodeLabel={(node: any) => `User: ${node.id}\nDC: ${node.degreeCentrality}`}
            nodeColor={(node: any) => `hsl(${node.degreeCentrality * 40}, 100%, 50%)`}
            linkColor={(link: any) => (link.type === "mention" ? "#1f77b4" : "#ff7f0e")}
            linkWidth={(link: any) => (link.type === "mention" ? 1 : 2)}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
        />
    );
}


