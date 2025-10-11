import type {
    RelationType,
    NodeLabel,
} from "@/app/interface/ConfigInterface";

export interface GraphQueryRequest {
    projectName: string;
    relationTypes: RelationType[];
    communityId?: number | null;
    nodeLabels?: NodeLabel[] | null; // i hope we will use it after Wiktor's graph rework
}
