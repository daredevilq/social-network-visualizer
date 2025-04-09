import {useRef} from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), {
    ssr: false,
});


function BaseGraph({
    graphData,
    nodeVal,
    nodeLabel,
    nodeColor,
    linkColor,
    linkWidth,
    linkDirectionalArrowLength,
    linkDirectionalArrowRelPos,
    onNodeClick,
}) {
    const fgRef = useRef(null);
    return (
        <div style={{width: "100%", height: "100%"}}>
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
                onNodeClick={onNodeClick}
            />
        </div>
    );
}

export default BaseGraph;