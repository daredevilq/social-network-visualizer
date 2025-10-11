package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.dto.config.ProjectConfigDto;
import com.example.social_network_visualizer_backend.dto.response.MessageResponse;
import com.example.social_network_visualizer_backend.dto.response.ProjectUpdateResponse;
import com.example.social_network_visualizer_backend.service.ProjectConfigService;
import com.example.social_network_visualizer_backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectConfigService projectConfigService;

    @GetMapping("/list")
    public ResponseEntity<List<ProjectSummary>> listAllProjects() {
        List<ProjectSummary> projectSummaries = projectService.getAllProjects();
        return ResponseEntity.ok(projectSummaries);
    }

    @GetMapping("/config/{projectName}")
    public ResponseEntity<ProjectConfigDto> get(@PathVariable String projectName) {
        return ResponseEntity.ok(projectConfigService.load(projectName));
    }

    @PostMapping("/{projectName}/import")
    public ResponseEntity<MessageResponse> importProjectWithGraph(
            @PathVariable String projectName) {
        log.info("Importing project: {}", projectName);
        int importedTweets = projectService.loadProject(projectName);
        String message = "Project " + projectName + " imported successfully. " + "Imported tweets: " + importedTweets + ".";

        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping(value = "/create-new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProjectUpdateResponse> createNewProject(
            @Valid @RequestPart("config") ProjectConfigDto projectConfig,
            @RequestPart("files") MultipartFile[] files) {

        log.info("Creating new project: {} with {} files", projectConfig.getProjectName(), files.length);
        log.debug("Project config - Metrics: {}", projectConfig.getMetrics());
        
        List<String> skippedFiles = projectService.createProject(projectConfig, files);
        String message = "Project " + projectConfig.getProjectName() + " processed successfully.";
        
        if (!skippedFiles.isEmpty()) {
            log.warn("Project created with {} skipped files: {}", skippedFiles.size(), skippedFiles);
        } else {
            log.info("Project {} created successfully with all files", projectConfig.getProjectName());
        }

        return ResponseEntity.ok(new ProjectUpdateResponse(message, skippedFiles));
    }

    @PutMapping("/{projectName}")
    public ResponseEntity<ProjectUpdateResponse> updateProjectFiles(@PathVariable String projectName, @RequestParam("files") MultipartFile[] files) {
        List<String> skippedFiles = projectService.updateProjectWithFiles(projectName, files);
        String message = "Project " + projectName + " processed successfully.";

        return ResponseEntity.ok(new ProjectUpdateResponse(message, skippedFiles));
    }

    @DeleteMapping("/{projectName}")
    public ResponseEntity<MessageResponse> deleteProjectWithName(@PathVariable String projectName) {
        log.info("Deleting project: {}", projectName);
        projectService.deleteProject(projectName);
        String message = "Project " + projectName + " deleted successfully.";

        return ResponseEntity.ok(new MessageResponse(message));
    }

    @DeleteMapping("/{projectName}/file/{fileName}")
    public ResponseEntity<MessageResponse> deleteFileInProject(@PathVariable String projectName, @PathVariable String fileName) {
        projectService.deleteFileFromProject(projectName, fileName);
        String message = "File '" + fileName + "' from project '" + projectName + "' deleted successfully.";

        return ResponseEntity.ok(new MessageResponse(message));
    }

    @GetMapping("/{projectName}/file")
    public ResponseEntity<List<String>> getProjectFiles(@PathVariable String projectName) {
        List<String> names = projectService.getProjectFileNames(projectName);
        return ResponseEntity.ok(names);
    }

    @PutMapping("/{projectName}/file")
    public ResponseEntity<ProjectUpdateResponse> appendFilesToProject(
            @PathVariable String projectName,
            @RequestParam("files") MultipartFile[] files) {
        List<String> skippedFiles = projectService.updateOpenedProject(projectName, files);
        String message = "Files added to project '" + projectName + "' successfully.";

        return ResponseEntity.ok(new ProjectUpdateResponse(message, skippedFiles));
    }
}
