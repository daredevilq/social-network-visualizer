import {GraphData} from "@/app/interface/GraphData";

export interface GraphProps<T extends GraphData> {
    graphData: T;
    nodeVal?: (node: any) => number;
    nodeLabel?: (node: any) => string;
    nodeColor?: (node: any) => string;
    linkColor?: (link: any) => string;
    linkWidth?: (link: any) => number;
    linkDirectionalArrowLength?: number;
    linkDirectionalArrowRelPos?: number;
}