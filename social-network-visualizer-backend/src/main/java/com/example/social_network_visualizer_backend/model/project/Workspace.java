package com.example.social_network_visualizer_backend.model.project;

import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import java.util.List;
import lombok.Data;

@Data
public class Workspace {
  private String name;
  private List<NodeDto> nodes;
  private List<LinkDto> edges;
}
