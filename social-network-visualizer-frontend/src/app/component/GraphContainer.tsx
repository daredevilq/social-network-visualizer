"use client";

import dynamic from "next/dynamic";
import StandardGraph from "@/app/graph/StandardGraph";

const AuthorMentionsGraph = dynamic(() => import("../graph/AuthorMentionsGraph"), {ssr: false});
const AuthorDegreeCentralityGraph = dynamic(() => import("../graph/AuthorDegreeCentralityGraph"), {ssr: false});
const CommunityGraph = dynamic(() => import("../graph/CommunityGraph"), {ssr: false});

interface GraphContainerProps {
    selectedGraph: string;
}

export default function GraphContainer({selectedGraph}: GraphContainerProps) {

    const renderGraph = () => {
        switch (selectedGraph) {
            case "standardGraph":
                return <StandardGraph/>;
            case "mentionsGraph":
                return <AuthorMentionsGraph/>
            case "degreeCentralityGraph":
                return <AuthorDegreeCentralityGraph/>
            case "communityGraph":
                return < CommunityGraph/>
            default:
                return <StandardGraph/>;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            {renderGraph()}
        </div>
    );
}