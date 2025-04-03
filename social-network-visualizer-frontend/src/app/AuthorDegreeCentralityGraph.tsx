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
        const links = data.links.map(link => ({
          ...link,
          type: link.source === link.target ? "mention" : "retweet",
        }));
        setGraphData({ nodes: data.nodes, links });
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div style={{ width: "100%", height: "800px" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeVal={(node: any) => (node.degreeCentrality ? node.degreeCentrality : 0)}
        nodeLabel={(node: any) => `User: ${node.id}\nDC: ${node.degreeCentrality}`}
        nodeColor={(node: any) => `hsl(${node.degreeCentrality * 40}, 100%, 50%)`} 
        linkColor={(link: any) => (link.type === "mention" ? "#1f77b4" : "#ff7f0e")}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link: any) => (link.type === "mention" ? 1 : 2)}
      />
    </div>
  );
}
