package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.dto.response.MessageResponse;
import com.example.social_network_visualizer_backend.dto.response.ProjectUpdateResponse;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.service.ProjectService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {
  private final ProjectService projectService;

  @GetMapping("/list")
  public ResponseEntity<List<ProjectSummary>> listAllProjects() {
    List<ProjectSummary> projectSummaries = projectService.getAllProjects();
    return ResponseEntity.ok(projectSummaries);
  }

  @PostMapping("/{projectName}/import")
  public ResponseEntity<MessageResponse> importProject(@PathVariable String projectName) {

    int importedTweets = projectService.importProject(projectName);
    log.info("Imported {} tweets", importedTweets);
    String message =
        "Project "
            + projectName
            + " imported successfully. "
            + "Imported tweets: "
            + importedTweets
            + ".";

    return ResponseEntity.ok(new MessageResponse(message));
  }

  @PostMapping("/{projectName}")
  public ResponseEntity<ProjectUpdateResponse> createNewProject(
      @PathVariable String projectName,
      @RequestParam(name = "files") MultipartFile[] files,
      @RequestParam(name = "config") String configJson) {

    ProjectConfig projectConfig = projectService.parseConfig(configJson);
    List<String> skippedFiles = projectService.createProject(projectName, projectConfig, files);
    String message = "Project " + projectName + " processed successfully.";

    return ResponseEntity.ok(new ProjectUpdateResponse(message, skippedFiles));
  }

  @PutMapping("/{projectName}")
  public ResponseEntity<ProjectUpdateResponse> updateProjectFiles(
      @PathVariable String projectName, @RequestParam("files") MultipartFile[] files) {
    List<String> skippedFiles = projectService.updateProjectWithFiles(projectName, files);
    String message = "Project " + projectName + " processed successfully.";

    return ResponseEntity.ok(new ProjectUpdateResponse(message, skippedFiles));
  }

  @DeleteMapping("/{projectName}")
  public ResponseEntity<MessageResponse> deleteProjectWithName(@PathVariable String projectName) {
    projectService.deleteProject(projectName);
    String message = "Project " + projectName + " deleted successfully.";

    return ResponseEntity.ok(new MessageResponse(message));
  }

  @DeleteMapping("/{projectName}/file/{fileName}")
  public ResponseEntity<MessageResponse> deleteFileInProject(
      @PathVariable String projectName, @PathVariable String fileName) {
    projectService.deleteFileFromProject(projectName, fileName);
    String message =
        "File '" + fileName + "' from project '" + projectName + "' deleted successfully.";

    return ResponseEntity.ok(new MessageResponse(message));
  }

  @GetMapping("/{projectName}/file")
  public ResponseEntity<List<String>> getProjectFiles(@PathVariable String projectName) {
    List<String> names = projectService.getProjectFileNames(projectName);
    return ResponseEntity.ok(names);
  }

  @PutMapping("/{projectName}/file")
  public ResponseEntity<ProjectUpdateResponse> appendFilesToProject(
      @PathVariable String projectName, @RequestParam("files") MultipartFile[] files) {
    List<String> skippedFiles = projectService.updateOpenedProject(projectName, files);
    String message = "Files added to project '" + projectName + "' successfully.";

    return ResponseEntity.ok(new ProjectUpdateResponse(message, skippedFiles));
  }

  @GetMapping("/{projectName}/config")
  public ResponseEntity<ProjectConfig> getProjectConfig(@PathVariable String projectName) {
    ProjectConfig config = projectService.getProjectConfig(projectName);
    return ResponseEntity.ok(config);
  }

  @GetMapping("/default-metrics")
  public ResponseEntity<List<MetricConfig>> getDefaultMetrics() {
    List<MetricConfig> defaultMetrics = projectService.getDefaultMetrics();
    return ResponseEntity.ok(defaultMetrics);
  }
}
