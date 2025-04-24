import { useEffect, useState } from "react";
import BaseGraph from "../model/BaseGraph";
import {GraphData, Link, Node} from "@/app/interface/GraphData";

interface GraphProps {
    shortestPath: string[];
}
export default function AuthorPagerankGraph({shortestPath}: GraphData) {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

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

