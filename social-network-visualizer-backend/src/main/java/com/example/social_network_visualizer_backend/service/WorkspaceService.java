package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.Workspace;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final ProjectRepository projectRepository;

    public List<String> getAllWorkspaces(String projectName) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> new ProjectException(
                        "Project with name '" + projectName + "' does not exist",
                        HttpStatus.NOT_FOUND
                ));

        if (project.getWorkspaces() == null || project.getWorkspaces().isEmpty()) {
            return Collections.emptyList();
        }

        return project.getWorkspaces()
                .stream()
                .map(Workspace::getName)
                .toList();
    }

    public void saveWorkspace(String projectName, Workspace workspaceData) {
        if (workspaceData.getName() == null || workspaceData.getName().isBlank()) {
            throw new ProjectException(
                    "Workspace name cannot be null or empty",
                    HttpStatus.BAD_REQUEST
            );
        }

        Project project = projectRepository.findByName(projectName)
            .orElseThrow(() -> new ProjectException(
                    "Project with name '" + projectName + "' does not exist",
                    HttpStatus.NOT_FOUND
            ));

        if (project.getWorkspaces() == null) {
            project.setWorkspaces(new ArrayList<>());
        }

        boolean updated = false;
        List<Workspace> workspaces = project.getWorkspaces();
        for (int i = 0; i < workspaces.size(); i++) {
            Workspace ws = workspaces.get(i);
            if (ws.getName() != null && ws.getName().equalsIgnoreCase(workspaceData.getName())) {
                workspaces.set(i, workspaceData);
                updated = true;
                break;
            }
        }

        if (!updated) {
            workspaces.add(workspaceData);
        }

        projectRepository.save(project);
    }

    public Workspace loadWorkspace(String projectName, String workspaceName) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> new ProjectException(
                        "Project with name '" + projectName + "' does not exist",
                        HttpStatus.NOT_FOUND
                ));

        return project.getWorkspaces()
                .stream()
                .filter(ws -> ws.getName().equalsIgnoreCase(workspaceName))
                .findFirst()
                .orElseThrow(() -> new ProjectException(
                        "Workspace with name '" + workspaceName + "' not found in project '" + projectName + "'",
                        HttpStatus.NOT_FOUND
                ));
    }

    public void deleteWorkspace(String projectName, String workspaceName) {
        if (workspaceName == null || workspaceName.isBlank()) {
            throw new ProjectException(
                    "Workspace name cannot be null or empty",
                    HttpStatus.BAD_REQUEST
            );
        }

        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> new ProjectException(
                        "Project with name '" + projectName + "' does not exist",
                        HttpStatus.NOT_FOUND
                ));

        if (project.getWorkspaces() == null || project.getWorkspaces().isEmpty()) {
            throw new ProjectException(
                    "Project '" + projectName + "' has no workspaces",
                    HttpStatus.NOT_FOUND
            );
        }

        Workspace deletedWorkspace = null;

        for (int i = 0; i < project.getWorkspaces().size(); i++) {
            Workspace workspace = project.getWorkspaces().get(i);
            if (workspace.getName() != null && workspace.getName().equalsIgnoreCase(workspaceName)) {
                deletedWorkspace = workspace;
                project.getWorkspaces().remove(i);
                break;
            }
        }

        if (deletedWorkspace == null) {
            throw new ProjectException(
                    "Workspace with name '" + workspaceName + "' does not exist in project '" + projectName + "'",
                    HttpStatus.NOT_FOUND
            );
        }

        projectRepository.save(project);
    }

}
