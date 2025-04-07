"use client";

import {useState} from "react";
import dynamic from "next/dynamic";
import StandardGraph from "@/app/graph/StandardGraph";

const ReactForceGraph = dynamic(() => import("./graph/ReactForceGraph"), {ssr: false});
const AuthorMentionsGraph = dynamic(() => import("./graph/AuthorMentionsGraph"), {ssr: false});
const AuthorDegreeCentralityGraph = dynamic(() => import("./graph/AuthorDegreeCentralityGraph"), {ssr: false});
const CommunityGraph = dynamic(() => import("./graph/CommunityGraph"), {ssr: false});

export default function GraphContainer() {
    const [selectedGraph, setSelectedGraph] = useState("forceGraph");

    const renderGraph = () => {
        switch (selectedGraph) {
            case "standardGraph":
                return <StandardGraph/>;
            case "mentionsGraph":
                return <AuthorMentionsGraph/>
            case "degreeCentralityGraph":
                return <AuthorDegreeCentralityGraph/>
            case "communityGraph":
                return< CommunityGraph/>
            default:
                return <StandardGraph/>;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            {/* Panel wyboru typu grafu - przezroczysty z białą ramką */}
            <div className="absolute top-2 w-full z-10 p-4 bg-transparent rounded-md">
                <select
                    value={selectedGraph}
                    onChange={(e) => setSelectedGraph(e.target.value)}
                    className="px-4 py-2 text-lg min-w-[250px] border border-white/30 rounded-md bg-transparent"
                >
                    <option value="standardGraph" className="text-black">Standard Graph</option>
                    <option value="mentionsGraph" className="text-black">Mentions Graph</option>
                    <option value="degreeCentralityGraph" className="text-black">Degree Centrality Graph</option>
                    <option value="communityGraph" className="text-black">Community Graph</option>
                </select>
            </div>

            {/* Kontener na graf - pełna przestrzeń */}
            <div className="w-full h-full">
                {renderGraph()}
            </div>
        </div>
    );
}