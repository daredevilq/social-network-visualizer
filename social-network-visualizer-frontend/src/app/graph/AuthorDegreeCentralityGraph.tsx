import { useEffect, useState } from "react";
import BaseGraph from "./BaseGraph";
import GraphData from "@/app/interface/GraphData"; // Importujemy nasz komponent bazowy

export default function AuthorPagerankGraph() {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

    useEffect(() => {
        fetch("http://localhost:8080/api/graph/author-mentions")
            .then((res) => res.json())
            .then((data) => {
                setGraphData(data);
            })
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    return (
        <BaseGraph
            graphData={graphData}
            nodeVal={(node: any) => (node.pagerank ? node.pagerank * 5 : 1)} // Przykład użycia pagerank
            nodeLabel={(node: any) =>
                `User: ${node.id}\nPR: ${node.pagerank?.toFixed(2)}\nComm: ${node.community}`
            }
            nodeColor={(node: any) => `hsl(${node.pagerank * 40}, 100%, 50%)`}
            linkColor={() => "#999"}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            linkWidth={1}
        />
    );
}

