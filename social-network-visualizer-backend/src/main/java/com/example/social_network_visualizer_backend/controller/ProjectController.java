package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/import/{projectName}")
    public ResponseEntity<Map<String, String>> importProjectWithName(@PathVariable String projectName) {
        projectService.loadProject(projectName);
        return ResponseEntity.ok(Map.of("message", "Project " + projectName + " imported successfully."));
    }

    @PostMapping("/{projectName}")
    public ResponseEntity<Map<String, String>> createNewProject(@PathVariable String projectName, @RequestParam("files") MultipartFile[] files) {
        projectService.createProject(projectName, files);
        return ResponseEntity.ok(Map.of("message", "Project " + projectName + " created successfully."));
    }

    @PutMapping("/{projectName}")
    public ResponseEntity<Map<String, String>> updateProjectFiles(@PathVariable String projectName, @RequestParam("files") MultipartFile[] files) {
        projectService.updateProjectWithFiles(projectName, files);
        return ResponseEntity.ok(Map.of("message", "Project " + projectName + " updated successfully."));
    }

    @DeleteMapping("/{projectName}")
    public ResponseEntity<Map<String, String>> deleteProjectWithName(@PathVariable String projectName) {
        projectService.deleteProject(projectName);
        return ResponseEntity.ok(Map.of("message", "Project " + projectName + " deleted successfully."));
    }

    @DeleteMapping("/{projectName}/file/{fileName}")
    public ResponseEntity<Map<String, String>> deleteFileInProject(@PathVariable String projectName, @PathVariable String fileName) {
        projectService.deleteFileFromProject(projectName, fileName);
        return ResponseEntity.ok(Map.of("message", "File '" + fileName + "' from project '" + projectName + "' deleted successfully."));
    }

    @GetMapping("/{projectName}/file")
    public ResponseEntity<List<String>> getProjectFiles(@PathVariable String projectName) {
        List<String> names = projectService.getProjectFileNames(projectName);
        return ResponseEntity.ok(names);
    }

    @PutMapping("/{projectName}/files/add")
    public ResponseEntity<Map<String, String>> addFilesToOpenedProject(@PathVariable String projectName, @RequestParam("files") MultipartFile[] files) {
        projectService.updateOpenedProject(projectName, files);
        return ResponseEntity.ok(Map.of("message", "Files added to project '" + projectName + "' successfully."));
    }
}
