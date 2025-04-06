import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import {GraphData, Link, Node} from "@/app/interface/GraphData";

export default function AuthorMentionsGraph() {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

    useEffect(() => {
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
    }, []);

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


