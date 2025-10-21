package com.example.social_network_visualizer_backend.model.project;

import java.util.List;
import lombok.Data;

@Data
public class Workspace {
  private String name;
  private List<Object> nodes;
  private List<Object> edges;
}
