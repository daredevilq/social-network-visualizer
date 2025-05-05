import { NodeObject, LinkObject } from 'force-graph';
import { MouseEvent } from 'react';

export interface GraphProps {
    graphData: {
        nodes: NodeObject[];
        links: LinkObject[];
    };
    nodeVal: (node: NodeObject) => number;
    nodeLabel: (node: NodeObject) => string;
    nodeColor: (node: NodeObject) => string;
    linkColor: (link: LinkObject) => string;
    linkWidth: (link: LinkObject) => number;
    linkDirectionalArrowLength: number;
    linkDirectionalArrowRelPos: number;
    onNodeClick: (node: NodeObject, event: MouseEvent) => void;
}

export interface SelectionBox {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}