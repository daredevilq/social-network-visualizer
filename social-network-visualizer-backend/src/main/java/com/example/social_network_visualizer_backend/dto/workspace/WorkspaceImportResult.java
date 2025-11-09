package com.example.social_network_visualizer_backend.dto.workspace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceImportResult {
  private String message;
  private String bannerType;

  public static WorkspaceImportResult fromImportStats(
      String workspaceName, int totalNodes, int importedNodes, int totalEdges, int importedEdges) {

    boolean isPartialImport = totalNodes > importedNodes || totalEdges > importedEdges;

    String message;
    String bannerType;

    if (importedNodes == 0 && importedEdges == 0) {
      message = "Failed to import workspace: No valid nodes or edges found in the database.";
      bannerType = "error";
    } else if (isPartialImport) {
      message =
          String.format(
              "Workspace '%s' partially imported: %d/%d nodes and %d/%d edges. Some items were skipped.",
              workspaceName, importedNodes, totalNodes, importedEdges, totalEdges);
      bannerType = "warning";
    } else {
      message =
          String.format(
              "Workspace '%s' successfully imported with %d nodes and %d edges.",
              workspaceName, importedNodes, importedEdges);
      bannerType = "success";
    }

    log.info(
        "Workspace '{}' imported: {}/{} nodes, {}/{} edges, banner: {}",
        workspaceName,
        importedNodes,
        totalNodes,
        importedEdges,
        totalEdges,
        bannerType);

    return new WorkspaceImportResult(message, bannerType);
  }
}
