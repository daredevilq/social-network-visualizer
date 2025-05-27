"use client";

import dynamic from "next/dynamic";
import StandardGraph from "@/app/graph/StandardGraph";
import {useProject} from "@/app/context/ProjectContext";
import { GraphType } from '@/app/interface/GraphType';

const AuthorMentionsGraph = dynamic(() => import("../graph/AuthorMentionsGraph"), {ssr: false});
const AuthorDegreeCentralityGraph = dynamic(() => import("../graph/AuthorDegreeCentralityGraph"), {ssr: false});
const CommunityGraph = dynamic(() => import("../graph/CommunityGraph"), {ssr: false});

export default function GraphContainer() {
    const { selectedGraphType } = useProject();

    const graph = (() => {
        switch (selectedGraphType) {
            case GraphType.MENTIONS:
                return <AuthorMentionsGraph />;
            case GraphType.DEGREE_CENTRALITY:
                return <AuthorDegreeCentralityGraph />;
            case GraphType.COMMUNITY:
                return <CommunityGraph/>;
            case GraphType.STANDARD:
            default:
                return <StandardGraph/>;
        }
    })();

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden text-[#FAFAFA]">
            {graph}
        </div>
    );
}