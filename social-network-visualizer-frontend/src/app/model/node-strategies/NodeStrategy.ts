import { GraphNode } from "@/types/GraphTypes";

export interface NodeStrategy {
    draw: (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    onSingleClick: (node: GraphNode) => void;
    onDoubleClick: (node: GraphNode) => void;
    getLabel: (node: GraphNode) => string;
    getColor: (node: GraphNode) => string;
}