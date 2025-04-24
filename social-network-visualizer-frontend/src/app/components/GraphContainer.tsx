"use client";

import dynamic from "next/dynamic";
import StandardGraph from "@/app/graph/StandardGraph";

const AuthorMentionsGraph = dynamic(() => import("../graph/AuthorMentionsGraph"), {ssr: false});
const AuthorDegreeCentralityGraph = dynamic(() => import("../graph/AuthorDegreeCentralityGraph"), {ssr: false});
const CommunityGraph = dynamic(() => import("../graph/CommunityGraph"), {ssr: false});

interface GraphContainerProps {
    selectedGraph: string,
    shortestPath: string[];
}

export default function GraphContainer({selectedGraph, shortestPath}: GraphContainerProps) {

    const renderGraph = () => {
        switch (selectedGraph) {
            case "standardGraph":
                return <StandardGraph shortestPath={shortestPath}/>;
            case "mentionsGraph":
                return <AuthorMentionsGraph shortestPath={shortestPath}/>
            case "degreeCentralityGraph":
                return <AuthorDegreeCentralityGraph shortestPath={shortestPath}/>
            case "communityGraph":
                return < CommunityGraph shortestPath={shortestPath}/>
            default:
                return <StandardGraph shortestPath={shortestPath}/>;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden text-[#FAFAFA]">
            {renderGraph()}
        </div>
    );
}