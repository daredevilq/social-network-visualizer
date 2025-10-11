import {GraphLink, GraphNode} from "@/types/GraphTypes";

export interface Node {
    id: string;
    degreeCentrality: number;
    pagerank: number;
    community: string;
}

export interface Link {
    source: string;
    target: string;
    type: string;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}