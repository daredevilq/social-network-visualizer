package com.example.social_network_visualizer_backend.dto.graph.graphNode;

import com.example.social_network_visualizer_backend.enums.NodeType;
import lombok.Data;

@Data
public class NodeDto {
  private String id;
  private NodeType nodeType;
}
