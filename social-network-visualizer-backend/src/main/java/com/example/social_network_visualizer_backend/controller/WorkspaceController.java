package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.model.project.Workspace;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/project/{projectName}/workspace")
@RequiredArgsConstructor
public class WorkspaceController {
  private final WorkspaceService workspaceService;

  @GetMapping("/list")
  public ResponseEntity<List<String>> listAllWorkspaces(@PathVariable String projectName) {
    List<String> workspacesList = workspaceService.getAllWorkspaces(projectName);
    return ResponseEntity.ok(workspacesList);
  }

  @PostMapping()
  public ResponseEntity<String> saveWorkspace(
      @PathVariable String projectName, @RequestBody Workspace workspace) {

    workspaceService.saveWorkspace(projectName, workspace);
    return ResponseEntity.ok("Workspace " + workspace.getName() + " was saved successfully.");
  }

  @GetMapping("/{workspaceName}/load")
  public ResponseEntity<Workspace> openWorkspace(
      @PathVariable String projectName, @PathVariable String workspaceName) {

    return ResponseEntity.ok(workspaceService.loadWorkspace(projectName, workspaceName));
  }

  @DeleteMapping("/{workspaceName}")
  public ResponseEntity<String> deleteWorkspace(
      @PathVariable String projectName, @PathVariable String workspaceName) {

    workspaceService.deleteWorkspace(projectName, workspaceName);
    return ResponseEntity.ok("Workspace " + workspaceName + " has been deleted successfully.");
  }
}
