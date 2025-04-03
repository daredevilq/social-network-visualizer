"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), {
  ssr: false,
});

export default function AuthorMentionsGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fgRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/graph/author-mentions")
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div style={{ width: "100%", height: "800px" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeVal={(node: any) => (node.pagerank ? node.pagerank * 5 : 1)}
        nodeAutoColorBy="community"
        nodeLabel={(node: any) =>
          `User: ${node.id}\nPR: ${node.pagerank?.toFixed(2)}\nComm: ${node.community}`
        }
        linkColor={() => "#999"}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkWidth={1}
      />
    </div>
  );
}
