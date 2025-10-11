// All types are fetched from backend /config/meta endpoint

export type Orientation = string;
export type RelationType = string;
export type NodeLabel = string;
export type MetricType = string;

export interface MetricConfig {
    type: MetricType;
    nodeLabels: NodeLabel[];
    relationTypes: RelationType[];
    orientation: Orientation;
}

export interface ProjectConfigDto {
    projectName: string;
    createdAt: string;
    metrics: MetricConfig[];
}
