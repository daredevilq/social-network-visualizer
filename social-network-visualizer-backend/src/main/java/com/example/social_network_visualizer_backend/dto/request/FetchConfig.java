package com.example.social_network_visualizer_backend.dto.request;

import com.example.social_network_visualizer_backend.enums.FetchStrategy;
import com.example.social_network_visualizer_backend.enums.NodeType;
import java.util.Collections;
import java.util.Map;

public record FetchConfig(FetchStrategy strategy, Map<NodeType, Integer> nodeLimits) {

  public static FetchConfig defaultConfig() {
    return new FetchConfig(FetchStrategy.ALL, Collections.emptyMap());
  }

  public static FetchConfig withLimits(Map<NodeType, Integer> nodeLimits) {
    return new FetchConfig(FetchStrategy.LIMIT_PER_TYPE, nodeLimits);
  }

  public Integer getLimitForNodeType(NodeType nodeType) {
    if (strategy != FetchStrategy.LIMIT_PER_TYPE) {
      return Integer.MAX_VALUE;
    }

    Integer limit = nodeLimits.get(nodeType);
    return (limit != null && limit > 0) ? limit : Integer.MAX_VALUE;
  }
}
