"use client";
import {useState} from "react";
import dynamic from "next/dynamic";

const ReactForceGraph = dynamic(() => import("./graph/ReactForceGraph"), {ssr: false});
const AuthorMentionsGraph = dynamic(() => import("./graph/AuthorMentionsGraph"), {ssr: false});
const AuthorDegreeCentralityGraph = dynamic(() => import("./graph/AuthorDegreeCentralityGraph"), {ssr: false});

export default function GraphContainer() {
    const [selectedGraph, setSelectedGraph] = useState("forceGraph"); // Domyślnie wybrany ForceGraph2D

    const renderGraph = () => {
        switch (selectedGraph) {
            case "forceGraph":
                return <ReactForceGraph></ReactForceGraph>
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

            {/* Wysuwana lista */}
            <div style={{marginBottom: "10px"}}>
                <select
                    value={selectedGraph}
                    onChange={(e) => setSelectedGraph(e.target.value)}
                    style={{padding: "10px", fontSize: "16px"}}
                >
                    <option value="forceGraph">React Force Graph</option>
                    <option value="mentionsGraph">Mentions Graph</option>
                    <option value="degreeCentralityGraph">Degree Centrality</option>
                </select>
            </div>

            {/* Wyświetlanie odpowiedniego wykresu */}
            <div style={{width: "100%", height: "90vh", overflow: "hidden"}}>
                {renderGraph()}
            </div>
        </div>
    );
}