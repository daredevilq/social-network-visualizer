import {useRef} from "react";
import {GraphData} from "@/app/interface/GraphData";

function BaseGraph<T extends GraphData>({ graphData, nodeVal, nodeLabel, nodeColor, linkColor, linkWidth, linkDirectionalArrowLength, linkDirectionalArrowRelPos }: GraphProps<T>) {
    const fgRef = useRef(null);

    return (
        <div style={{ width: "100%", height: "100%" }}>
    <ForceGraph2D
        ref={fgRef}
    graphData={graphData}
    nodeVal={nodeVal}
    nodeLabel={nodeLabel}
    nodeColor={nodeColor}
    linkColor={linkColor}
    linkWidth={linkWidth}
    linkDirectionalArrowLength={linkDirectionalArrowLength}
    linkDirectionalArrowRelPos={linkDirectionalArrowRelPos}
    />
    </div>
);
}

export default BaseGraph;