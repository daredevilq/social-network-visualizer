import { NodeType, RelationType } from "./GraphTypes";

export interface GraphQueryRequest {
    nodeTypes: NodeType[];
    relationTypes: RelationType[];
}
