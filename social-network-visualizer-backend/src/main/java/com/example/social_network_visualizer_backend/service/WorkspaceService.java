package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.Workspace;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {
  private final ProjectRepository projectRepository;

  public List<String> getAllWorkspaces(String projectName) {
    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getWorkspaces() == null || project.getWorkspaces().isEmpty()) {
      log.warn("Project '{}' has no workspaces", projectName);
      return Collections.emptyList();
    }

    List<String> workspaces = project.getWorkspaces().stream().map(Workspace::getName).toList();

    log.info("Found {} workspaces for project '{}'", workspaces.size(), projectName);
    return workspaces;
  }

  public void saveWorkspace(String projectName, Workspace workspaceData) {
    if (workspaceData.getName() == null || workspaceData.getName().isBlank()) {
      log.error("Workspace name is null or blank for project '{}'", projectName);
      throw new ProjectException("Workspace name cannot be null or empty", HttpStatus.BAD_REQUEST);
    }

    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getWorkspaces() == null) {
      project.setWorkspaces(new ArrayList<>());
    }

    boolean updated = false;
    List<Workspace> workspaces = project.getWorkspaces();
    for (int i = 0; i < workspaces.size(); i++) {
      Workspace ws = workspaces.get(i);
      if (ws.getName() != null && ws.getName().equalsIgnoreCase(workspaceData.getName())) {
        log.info(
            "Updating existing workspace '{}' in project '{}'",
            workspaceData.getName(),
            projectName);
        workspaces.set(i, workspaceData);
        updated = true;
        break;
      }
    }

    if (!updated) {
      log.info("Adding new workspace '{}' to project '{}'", workspaceData.getName(), projectName);
      workspaces.add(workspaceData);
    }

    projectRepository.save(project);
  }

  public Workspace loadWorkspace(String projectName, String workspaceName) {
    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    Workspace workspace =
        project.getWorkspaces().stream()
            .filter(ws -> ws.getName().equalsIgnoreCase(workspaceName))
            .findFirst()
            .orElseThrow(
                () -> {
                  log.error("Workspace '{}' not found in project '{}'", workspaceName, projectName);
                  return new ProjectException(
                      "Workspace with name '"
                          + workspaceName
                          + "' not found in project '"
                          + projectName
                          + "'",
                      HttpStatus.NOT_FOUND);
                });

    log.info("Workspace '{}' loaded successfully from project '{}'", workspaceName, projectName);
    return workspace;
  }

  public void deleteWorkspace(String projectName, String workspaceName) {
    if (workspaceName == null || workspaceName.isBlank()) {
      log.error("Workspace name is null or blank for project '{}'", projectName);
      throw new ProjectException("Workspace name cannot be null or empty", HttpStatus.BAD_REQUEST);
    }

    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getWorkspaces() == null || project.getWorkspaces().isEmpty()) {
      log.warn("Project '{}' has no workspaces to delete", projectName);
      throw new ProjectException(
          "Project '" + projectName + "' has no workspaces", HttpStatus.NOT_FOUND);
    }

    Workspace deletedWorkspace = null;

    for (int i = 0; i < project.getWorkspaces().size(); i++) {
      Workspace workspace = project.getWorkspaces().get(i);
      if (workspace.getName() != null && workspace.getName().equalsIgnoreCase(workspaceName)) {
        deletedWorkspace = workspace;
        project.getWorkspaces().remove(i);
        log.info("Workspace '{}' deleted from project '{}'", workspaceName, projectName);
        break;
      }
    }

    if (deletedWorkspace == null) {
      log.error("Workspace '{}' does not exist in project '{}'", workspaceName, projectName);
      throw new ProjectException(
          "Workspace with name '"
              + workspaceName
              + "' does not exist in project '"
              + projectName
              + "'",
          HttpStatus.NOT_FOUND);
    }

    projectRepository.save(project);
  }
}
