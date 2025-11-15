package com.example.social_network_visualizer_backend.dto.workspace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceImportResult {
  private String workspaceName;
  private int totalNodes;
  private int importedNodes;
  private int totalEdges;
  private int importedEdges;
}
