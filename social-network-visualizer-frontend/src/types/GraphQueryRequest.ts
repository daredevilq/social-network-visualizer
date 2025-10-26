import { NodeType, RelationType } from "./GraphTypes";

export enum FetchStrategy {
  LIMIT_PER_TYPE = "LIMIT_PER_TYPE",
  ALL = "ALL",
}

export interface FetchConfig {
  strategy: FetchStrategy;
  nodeLimits?: Record<NodeType, number>;
}

export interface GraphQueryRequest {
  nodeTypes: NodeType[];
  relationTypes: RelationType[];
  fetchConfig?: FetchConfig; // FetchStrategy.ALL if undefined
}
