package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<String> importProjectWithName(@PathVariable String projectName) {
        projectService.loadProject(projectName);
        return ResponseEntity.ok("Project " + projectName + " imported successfully.");
    }
}
