package com.example.social_network_visualizer_backend.service.graph;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import java.util.List;
import java.util.Optional;

public interface NodeQueryStrategy {

  default List<? extends NodeDto> fetchNodes(
      Optional<Integer> communityId, boolean inWorkspace, Integer limit) {
    return null;
  }

  NodeType getNodeType();
}
