import { FetchConfig, FetchStrategy } from "@/types/GraphQueryRequest";
import { NodeType } from "@/types/GraphTypes";

export const DEFAULT_FETCH_CONFIG: FetchConfig = {
  strategy: FetchStrategy.LIMIT_PER_TYPE,
  nodeLimits: {
    [NodeType.AUTHOR]: 100,
    [NodeType.TWEET]: 100,
    [NodeType.HASHTAG]: 100,
  },
};
