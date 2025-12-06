package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.workspace.WorkspaceImportResult;
import com.example.social_network_visualizer_backend.exceptions.WorkspaceException;
import com.example.social_network_visualizer_backend.model.project.Workspace;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(WorkspaceController.class)
class WorkspaceControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private WorkspaceService workspaceService;

  @MockitoBean private GraphService graphService;

  @Test
  void testListAllWorkspaces_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    List<String> workspaces = Arrays.asList("workspace1", "workspace2", "workspace3");
    when(workspaceService.getAllWorkspaces(projectName)).thenReturn(workspaces);

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace/list", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3))
        .andExpect(jsonPath("$[0]").value("workspace1"));

    verify(workspaceService, times(1)).getAllWorkspaces(projectName);
  }

  @Test
  void testSaveWorkspace_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    Workspace workspace = new Workspace();
    workspace.setName("newWorkspace");
    doNothing().when(workspaceService).saveWorkspace(eq(projectName), any(Workspace.class));

    // Act & Assert
    mockMvc
        .perform(
            post("/project/{projectName}/workspace", projectName)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workspace)))
        .andExpect(status().isOk())
        .andExpect(content().string("Workspace newWorkspace was saved successfully."));

    verify(workspaceService, times(1)).saveWorkspace(eq(projectName), any(Workspace.class));
  }

  @Test
  void testLoadWorkspace_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    String workspaceName = "workspace1";
    doNothing().when(workspaceService).loadWorkspace(projectName, workspaceName);

    // Act & Assert
    mockMvc
        .perform(
            put("/project/{projectName}/workspace/{workspaceName}", projectName, workspaceName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().string("Workspace workspace1 has been loaded successfully."));

    verify(workspaceService, times(1)).loadWorkspace(projectName, workspaceName);
  }

  @Test
  void testDeleteWorkspace_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    String workspaceName = "workspaceToDelete";
    doNothing().when(workspaceService).deleteWorkspace(projectName, workspaceName);

    // Act & Assert
    mockMvc
        .perform(
            delete("/project/{projectName}/workspace/{workspaceName}", projectName, workspaceName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().string("Workspace workspaceToDelete has been deleted successfully."));

    verify(workspaceService, times(1)).deleteWorkspace(projectName, workspaceName);
  }

  @Test
  void testFetchWorkspace_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    GraphDataDto graphData = new GraphDataDto(List.of(), List.of());
    when(graphService.fetchWorkspaceData()).thenReturn(graphData);

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(graphService, times(1)).fetchWorkspaceData();
  }

  @Test
  void testExportWorkspace_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    String workspaceName = "workspace1";
    Workspace workspace = new Workspace();
    when(workspaceService.getWorkspaceByNameWithFullNodes(projectName, workspaceName))
        .thenReturn(workspace);

    // Act & Assert
    mockMvc
        .perform(
            get(
                    "/project/{projectName}/workspace/{workspaceName}/export",
                    projectName,
                    workspaceName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(workspaceService, times(1)).getWorkspaceByNameWithFullNodes(projectName, workspaceName);
  }

  @Test
  void testImportWorkspace_Success() throws Exception {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "workspace.json", "application/json", "{\"name\":\"test\"}".getBytes());
    WorkspaceImportResult importResult = new WorkspaceImportResult();
    when(workspaceService.validateAndImportWorkspace(eq(projectName), any()))
        .thenReturn(importResult);

    // Act & Assert
    mockMvc
        .perform(multipart("/project/{projectName}/workspace/import", projectName).file(file))
        .andExpect(status().isOk());

    verify(workspaceService, times(1)).validateAndImportWorkspace(eq(projectName), any());
  }

  @Test
  void testListAllWorkspaces_EmptyList() throws Exception {
    // Arrange
    String projectName = "emptyProject";
    List<String> emptyList = Arrays.asList();
    when(workspaceService.getAllWorkspaces(projectName)).thenReturn(emptyList);

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace/list", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(workspaceService, times(1)).getAllWorkspaces(projectName);
  }

  @Test
  void testFetchWorkspace_EmptyGraph() throws Exception {
    // Arrange
    String projectName = "emptyProject";
    GraphDataDto emptyGraph = new GraphDataDto(Collections.emptyList(), Collections.emptyList());
    when(graphService.fetchWorkspaceData()).thenReturn(emptyGraph);

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray())
        .andExpect(jsonPath("$.nodes.length()").value(0))
        .andExpect(jsonPath("$.links").isArray())
        .andExpect(jsonPath("$.links.length()").value(0));

    verify(graphService, times(1)).fetchWorkspaceData();
  }

  @Test
  void testFetchWorkspace_ServiceThrowsException() throws Exception {
    // Arrange
    String projectName = "testProject";
    when(graphService.fetchWorkspaceData())
        .thenThrow(new RuntimeException("Failed to fetch workspace graph"));

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(graphService, times(1)).fetchWorkspaceData();
  }

  @Test
  void testSaveWorkspace_ProjectNotFound() throws Exception {
    // Arrange
    String projectName = "nonExistentProject";
    Workspace workspace = new Workspace();
    doThrow(new EntityNotFoundException("Project not found: " + projectName))
        .when(workspaceService)
        .saveWorkspace(eq(projectName), any(Workspace.class));

    // Act & Assert
    mockMvc
        .perform(
            post("/project/{projectName}/workspace", projectName)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workspace)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Project not found: " + projectName));

    verify(workspaceService, times(1)).saveWorkspace(eq(projectName), any(Workspace.class));
  }

  @Test
  void testSaveWorkspace_InvalidWorkspaceData() throws Exception {
    // Arrange
    String projectName = "testProject";
    String invalidJson = "{ invalid json }";

    // Act & Assert
    mockMvc
        .perform(
            post("/project/{projectName}/workspace", projectName)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
        .andExpect(status().isInternalServerError());
  }

  @Test
  void testDeleteWorkspace_WorkspaceNotFound() throws Exception {
    // Arrange
    String projectName = "testProject";
    String workspaceName = "nonExistentWorkspace";
    doThrow(new EntityNotFoundException("Workspace not found: " + workspaceName))
        .when(workspaceService)
        .deleteWorkspace(projectName, workspaceName);

    // Act & Assert
    mockMvc
        .perform(
            delete("/project/{projectName}/workspace/{workspaceName}", projectName, workspaceName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Workspace not found: " + workspaceName));

    verify(workspaceService, times(1)).deleteWorkspace(projectName, workspaceName);
  }

  @Test
  void testDeleteWorkspace_ServiceThrowsException() throws Exception {
    // Arrange
    String projectName = "testProject";
    String workspaceName = "testWorkspace";
    doThrow(new RuntimeException("Failed to delete workspace"))
        .when(workspaceService)
        .deleteWorkspace(projectName, workspaceName);

    // Act & Assert
    mockMvc
        .perform(
            delete("/project/{projectName}/workspace/{workspaceName}", projectName, workspaceName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(workspaceService, times(1)).deleteWorkspace(projectName, workspaceName);
  }

  @Test
  void testImportWorkspace_FileNotProvided() throws Exception {
    // Arrange
    String projectName = "testProject";

    // Act & Assert
    mockMvc
        .perform(multipart("/project/{projectName}/workspace/import", projectName))
        .andExpect(status().isInternalServerError());
  }

  @Test
  void testImportWorkspace_InvalidFileFormat() throws Exception {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file =
        new MockMultipartFile("file", "test.txt", "text/plain", "invalid content".getBytes());
    doThrow(new WorkspaceException("Invalid workspace file format", HttpStatus.BAD_REQUEST))
        .when(workspaceService)
        .validateAndImportWorkspace(eq(projectName), any());

    // Act & Assert
    mockMvc
        .perform(multipart("/project/{projectName}/workspace/import", projectName).file(file))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Invalid workspace file format"));

    verify(workspaceService, times(1)).validateAndImportWorkspace(eq(projectName), any());
  }

  @Test
  void testImportWorkspace_ProjectNotFound() throws Exception {
    // Arrange
    String projectName = "nonExistentProject";
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "workspace.json", "application/json", "{\"name\":\"test\"}".getBytes());
    doThrow(new EntityNotFoundException("Project not found: " + projectName))
        .when(workspaceService)
        .validateAndImportWorkspace(eq(projectName), any());

    // Act & Assert
    mockMvc
        .perform(multipart("/project/{projectName}/workspace/import", projectName).file(file))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Project not found: " + projectName));

    verify(workspaceService, times(1)).validateAndImportWorkspace(eq(projectName), any());
  }

  @Test
  void testListAllWorkspaces_ProjectNotFound() throws Exception {
    // Arrange
    String projectName = "nonExistentProject";
    when(workspaceService.getAllWorkspaces(projectName))
        .thenThrow(new EntityNotFoundException("Project not found: " + projectName));

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace/list", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Project not found: " + projectName));

    verify(workspaceService, times(1)).getAllWorkspaces(projectName);
  }

  @Test
  void testListAllWorkspaces_ServiceThrowsException() throws Exception {
    // Arrange
    String projectName = "testProject";
    when(workspaceService.getAllWorkspaces(projectName))
        .thenThrow(new RuntimeException("Failed to list workspaces"));

    // Act & Assert
    mockMvc
        .perform(
            get("/project/{projectName}/workspace/list", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(workspaceService, times(1)).getAllWorkspaces(projectName);
  }
}
