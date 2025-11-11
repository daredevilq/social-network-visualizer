package com.example.social_network_visualizer_backend.dto.workspace;

import com.example.social_network_visualizer_backend.enums.WorkspaceImportResultStatus;
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
  private String importResultStatus;
  private String workspaceName;

  public static WorkspaceImportResult fromImportStats(
      String workspaceName, int totalNodes, int importedNodes, int totalEdges, int importedEdges) {

    boolean isPartialImport = totalNodes > importedNodes || totalEdges > importedEdges;

    String message;
    String importResultStatus;

    if (importedNodes == 0 && importedEdges == 0) {
      message = "Failed to import workspace: No valid nodes or edges found in the database.";
      importResultStatus = WorkspaceImportResultStatus.ERROR.getLabel();
    } else if (isPartialImport) {
      message =
          String.format(
              "Workspace '%s' partially imported: %d/%d nodes and %d/%d edges. Some items were skipped.",
              workspaceName, importedNodes, totalNodes, importedEdges, totalEdges);
      importResultStatus = WorkspaceImportResultStatus.WARNING.getLabel();
    } else {
      message =
          String.format(
              "Workspace '%s' successfully imported with %d nodes and %d edges.",
              workspaceName, importedNodes, importedEdges);
      importResultStatus = WorkspaceImportResultStatus.SUCCESS.getLabel();
    }

    log.info(
        "Workspace '{}' imported: {}/{} nodes, {}/{} edges, banner: {}",
        workspaceName,
        importedNodes,
        totalNodes,
        importedEdges,
        totalEdges,
        importResultStatus);

    return new WorkspaceImportResult(message, importResultStatus, workspaceName);
  }
}
