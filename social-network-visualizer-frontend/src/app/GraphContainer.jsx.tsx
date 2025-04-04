"use client";
import {useState} from "react";
import dynamic from "next/dynamic";
import StandardGraph from "@/app/graph/StandardGraph";

const ReactForceGraph = dynamic(() => import("./graph/ReactForceGraph"), {ssr: false});
const AuthorMentionsGraph = dynamic(() => import("./graph/AuthorMentionsGraph"), {ssr: false});
const AuthorDegreeCentralityGraph = dynamic(() => import("./graph/AuthorDegreeCentralityGraph"), {ssr: false});

export default function GraphContainer() {
    const [selectedGraph, setSelectedGraph] = useState("forceGraph");

    const renderGraph = () => {
        switch (selectedGraph) {
            case "forceGraph":
                return <ReactForceGraph></ReactForceGraph>
            case "standardGraph":
                return <StandardGraph></StandardGraph>
            case "mentionsGraph":
                return <AuthorMentionsGraph/>
            case "degreeCentralityGraph":
                return <AuthorDegreeCentralityGraph/>
            default:
                return <ReactForceGraph/>;
        }
    };

    return (
        <div style={{width: "100%", height: "100vh", overflow: "hidden"}}>
            <h1>Choose type of graph you would like to see:</h1>

            {/* Type of Graph List */}
            <div style={{marginBottom: "10px"}}>
                <select
                    value={selectedGraph}
                    onChange={(e) => setSelectedGraph(e.target.value)}
                    style={{padding: "10px", fontSize: "16px"}}
                >
                    <option value="standardGraph">Standard Graph</option>
                    <option value="forceGraph">React Force Graph</option>
                    <option value="mentionsGraph">Mentions Graph</option>
                    <option value="degreeCentralityGraph">Degree Centrality Graph</option>
                </select>
            </div>

            {/* Graph */}
            <div style={{width: "100%", height: "80vh", overflow: "hidden"}}>
                {renderGraph()}
            </div>
        </div>
    );
}