export interface GraphData {
    nodes: Array<{
        id: string;
        [key: string]: any;
    }>;
    links: Array<{
        source: string;
        target: string;
        [key: string]: any;
    }>;
}
