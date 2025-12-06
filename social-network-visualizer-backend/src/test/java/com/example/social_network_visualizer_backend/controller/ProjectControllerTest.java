package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProjectController.class)
class ProjectControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private ProjectService projectService;

  @Test
  void testListAllProjects_Success() throws Exception {
    // Arrange
    ProjectSummary projectSummary = new ProjectSummary("testProject", 5);
    List<ProjectSummary> projectSummaries = Arrays.asList(projectSummary, projectSummary, projectSummary);
    when(projectService.getAllProjects()).thenReturn(projectSummaries);

    // Act & Assert
    mockMvc
        .perform(get("/project/list").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(projectService, times(1)).getAllProjects();
  }

  @Test
  void testImportProject_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    int importedTweets = 100;
    when(projectService.importProject(projectName)).thenReturn(importedTweets);

    // Act & Assert
    mockMvc
        .perform(
            post("/project/{projectName}/import", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Project " + projectName
            + " imported successfully. Imported tweets: " + importedTweets + "."));

    verify(projectService, times(1)).importProject(projectName);
  }

  @Test
  void testCreateNewProject_Success() throws Exception {
    // Arrange
    String projectName = "newProject";
    String configJson = "{\"name\":\"test\"}";
    MockMultipartFile file1 =
        new MockMultipartFile("files", "test1.json", "application/json", "content1".getBytes());
    MockMultipartFile file2 =
        new MockMultipartFile("files", "test2.json", "application/json", "content2".getBytes());
    List<String> skippedFiles = Arrays.asList();
    ProjectConfig projectConfig = new ProjectConfig(java.time.Instant.now(), List.of());

    when(projectService.parseConfig(configJson)).thenReturn(projectConfig);
    when(projectService.createProject(eq(projectName), eq(projectConfig), any()))
        .thenReturn(skippedFiles);

    // Act & Assert
    mockMvc
        .perform(
            multipart("/project/{projectName}", projectName)
                .file(file1)
                .file(file2)
                .param("config", configJson))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.message").value("Project " + projectName + " processed successfully."));

    verify(projectService, times(1)).parseConfig(configJson);
    verify(projectService, times(1)).createProject(eq(projectName), eq(projectConfig), any());
  }

  @Test
  void testUpdateProjectFiles_Success() throws Exception {
    // Arrange
    String projectName = "existingProject";
    MockMultipartFile file =
        new MockMultipartFile("files", "update.json", "application/json", "content".getBytes());
    List<String> skippedFiles = Arrays.asList("skipped.json");

    when(projectService.updateProjectWithFiles(eq(projectName), any())).thenReturn(skippedFiles);

    // Act & Assert
    mockMvc
        .perform(multipart("/project/{projectName}", projectName).file(file).with(request -> {
          request.setMethod("PUT");
          return request;
        }))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.message").value("Project " + projectName + " processed successfully."));

    verify(projectService, times(1)).updateProjectWithFiles(eq(projectName), any());
  }

  @Test
  void testDeleteProjectWithName_Success() throws Exception {
    // Arrange
    String projectName = "projectToDelete";
    doNothing().when(projectService).deleteProject(projectName);

    // Act & Assert
    mockMvc
        .perform(delete("/project/{projectName}", projectName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.message").value("Project " + projectName + " deleted successfully."));

    verify(projectService, times(1)).deleteProject(projectName);
  }

  @Test
  void testDeleteFileInProject_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    String fileName = "fileToDelete.json";
    doNothing().when(projectService).deleteFileFromProject(projectName, fileName);

    // Act & Assert
    mockMvc
        .perform(
            delete("/project/{projectName}/file/{fileName}", projectName, fileName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.message")
                .value(
                    "File '"
                        + fileName
                        + "' from project '"
                        + projectName
                        + "' deleted successfully."));

    verify(projectService, times(1)).deleteFileFromProject(projectName, fileName);
  }

  @Test
  void testGetProjectFiles_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    List<String> fileNames = Arrays.asList("file1.json", "file2.json", "file3.json");
    when(projectService.getProjectFileNames(projectName)).thenReturn(fileNames);

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/file", projectName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(projectService, times(1)).getProjectFileNames(projectName);
  }

  @Test
  void testAppendFilesToProject_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file =
        new MockMultipartFile("files", "append.json", "application/json", "content".getBytes());
    List<String> skippedFiles = Arrays.asList();

    when(projectService.updateOpenedProject(eq(projectName), any())).thenReturn(skippedFiles);

    // Act & Assert
    mockMvc
        .perform(multipart("/project/{projectName}/file", projectName).file(file).with(request -> {
          request.setMethod("PUT");
          return request;
        }))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.message")
                .value("Files added to project '" + projectName + "' successfully."));

    verify(projectService, times(1)).updateOpenedProject(eq(projectName), any());
  }

  @Test
  void testGetProjectConfig_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    ProjectConfig projectConfig = new ProjectConfig(java.time.Instant.now(), List.of());
    when(projectService.getProjectConfig(projectName)).thenReturn(projectConfig);

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/config", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(projectService, times(1)).getProjectConfig(projectName);
  }

  @Test
  void testGetDefaultMetrics_Success() throws Exception {
    // Arrange
    MetricConfig metricConfig = new MetricConfig(MetricType.PAGERANK, Set.of(NodeType.AUTHOR), Set.of(RelationType.MENTIONS), Orientation.NATURAL);
    List<MetricConfig> defaultMetrics = Arrays.asList(metricConfig, metricConfig, metricConfig);
    when(projectService.getDefaultMetrics()).thenReturn(defaultMetrics);

    // Act & Assert
    mockMvc
        .perform(get("/project/default-metrics").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(projectService, times(1)).getDefaultMetrics();
  }

  @Test
  void testGetProjects_EmptyResult() throws Exception {
    // Arrange
    when(projectService.getAllProjects()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/project/list").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(projectService, times(1)).getAllProjects();
  }

  @Test
  void testGetProjects_ServiceThrowsException() throws Exception {
    // Arrange
    when(projectService.getAllProjects())
        .thenThrow(new RuntimeException("Database connection error"));

    // Act & Assert
    mockMvc
        .perform(get("/project/list").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(projectService, times(1)).getAllProjects();
  }

  @Test
  void testDeleteProject_ProjectNotFound() throws Exception {
    // Arrange
    String projectName = "nonExistentProject";
    doThrow(new EntityNotFoundException("Project not found: " + projectName))
        .when(projectService).deleteProject(projectName);

    // Act & Assert
    mockMvc
        .perform(delete("/project/{projectName}", projectName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Project not found: " + projectName));

    verify(projectService, times(1)).deleteProject(projectName);
  }

  @Test
  void testDeleteProject_ServiceThrowsException() throws Exception {
    // Arrange
    String projectName = "testProject";
    doThrow(new RuntimeException("Failed to delete project"))
        .when(projectService).deleteProject(projectName);

    // Act & Assert
    mockMvc
        .perform(delete("/project/{projectName}", projectName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(projectService, times(1)).deleteProject(projectName);
  }

  @Test
  void testGetProjectConfig_ProjectNotFound() throws Exception {
    // Arrange
    String projectName = "nonExistentProject";
    when(projectService.getProjectConfig(projectName))
        .thenThrow(new EntityNotFoundException("Project not found: " + projectName));

    // Act & Assert
    mockMvc
        .perform(get("/project/{projectName}/config", projectName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Project not found: " + projectName));

    verify(projectService, times(1)).getProjectConfig(projectName);
  }

  @Test
  void testGetDefaultMetrics_EmptyResult() throws Exception {
    // Arrange
    when(projectService.getDefaultMetrics()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/project/default-metrics").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(projectService, times(1)).getDefaultMetrics();
  }

  @Test
  void testGetDefaultMetrics_ServiceThrowsException() throws Exception {
    // Arrange
    when(projectService.getDefaultMetrics())
        .thenThrow(new RuntimeException("Failed to load default metrics"));

    // Act & Assert
    mockMvc
        .perform(get("/project/default-metrics").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(projectService, times(1)).getDefaultMetrics();
  }
}

