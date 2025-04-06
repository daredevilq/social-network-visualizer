import {useRef} from "react";
import {GraphData} from "@/app/interface/GraphData";

function BaseGraph<T extends GraphData>({ graphData, nodeVal, nodeLabel, nodeColor, linkColor, linkWidth, linkDirectionalArrowLength, linkDirectionalArrowRelPos }) {
    const fgRef = useRef(null);

    return (
        <div id="ForceGraph2DCon" style={{ width: "100%", height: "100%", position: 'relative',
            overflow: 'hidden',
            borderRadius: '30px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
            maskImage: 'radial-gradient(circle, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 70%)' }}>
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