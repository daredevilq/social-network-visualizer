package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.community.CommunityOverview;
import com.example.social_network_visualizer_backend.dto.community.CommunitySummary;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.service.CommunityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;

import java.util.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CommunityController.class)
class CommunityControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private CommunityService communityService;

  @Test
  void testGetAllCommunities_Success() throws Exception {
    // Arrange
    CommunitySummary summary = new CommunitySummary(1, 10, "testUser", 0.5, List.of("tag1", "tag2"), List.of());
    List<CommunitySummary> summaries = Arrays.asList(summary, summary);
    when(communityService.listAllCommunities()).thenReturn(summaries);

    // Act & Assert
    mockMvc
        .perform(get("/community/list").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(communityService, times(1)).listAllCommunities();
  }

  @Test
  void testGetCommunities_Success() throws Exception {
    // Arrange
    int page = 0;
    int size = 25;
    CommunitySummary summary = new CommunitySummary(1, 10, "testUser", 0.5, List.of("tag1", "tag2"), List.of());
    List<CommunitySummary> summaries = Arrays.asList(summary, summary);
    when(communityService.listCommunities(page, size)).thenReturn(summaries);

    // Act & Assert
    mockMvc
        .perform(
            get("/community/list-slow")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(communityService, times(1)).listCommunities(page, size);
  }

  @Test
  void testGetCommunities_WithDefaultParameters() throws Exception {
    // Arrange
    CommunitySummary summary = new CommunitySummary(1, 10, "testUser", 0.5, List.of("tag1", "tag2"), List.of());
    List<CommunitySummary> summaries = Arrays.asList(summary, summary);
    when(communityService.listCommunities(0, 25)).thenReturn(summaries);

    // Act & Assert
    mockMvc
        .perform(get("/community/list-slow").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());

    verify(communityService, times(1)).listCommunities(0, 25);
  }

  @Test
  void testGetTopCommunityIds_Success() throws Exception {
    // Arrange
    int limit = 10;
    List<Integer> topIds = Arrays.asList(1, 2, 3, 4, 5);
    when(communityService.getTopCommunityIds(limit)).thenReturn(topIds);

    // Act & Assert
    mockMvc
        .perform(
            get("/community/top-ids")
                .param("limit", String.valueOf(limit))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(5));

    verify(communityService, times(1)).getTopCommunityIds(limit);
  }

  @Test
  void testGetTopCommunityIds_WithDefaultLimit() throws Exception {
    // Arrange
    List<Integer> topIds = Arrays.asList(1, 2, 3);
    when(communityService.getTopCommunityIds(10)).thenReturn(topIds);

    // Act & Assert
    mockMvc
        .perform(get("/community/top-ids").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());

    verify(communityService, times(1)).getTopCommunityIds(10);
  }

  @Test
  void testGetCommunityOverview_Success() throws Exception {
    // Arrange
    CommunityOverview overview = new CommunityOverview(2.5, 1000L, 5, 10, 100, 50.0, 20.0, 30.0, 50.0, 70.0, 90.0, List.of(), 10.5, 50L);
    when(communityService.getCommunityOverview()).thenReturn(overview);

    // Act & Assert
    mockMvc
        .perform(get("/community/overview").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(communityService, times(1)).getCommunityOverview();
  }

  @Test
  void testGetCommunitySummaryById_Success() throws Exception {
    // Arrange
    int communityId = 1;
    CommunitySummary summary = new CommunitySummary(1, 10, "testUser", 0.5, List.of("tag1", "tag2"), List.of());
    when(communityService.getCommunitySummary(communityId)).thenReturn(summary);

    // Act & Assert
    mockMvc
        .perform(
            get("/community/summary/{communityId}", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(communityService, times(1)).getCommunitySummary(communityId);
  }

  @Test
  void testGetAuthorsWithGivenCommunityId_Success() throws Exception {
    // Arrange
    int communityId = 1;
    Author author = new Author();
    List<Author> authors = Arrays.asList(author, author, author);
    when(communityService.getAuthorsWithCommunityId(communityId)).thenReturn(authors);

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/authors", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(communityService, times(1)).getAuthorsWithCommunityId(communityId);
  }

  @Test
  void testGetCommunityActivityHeatMap_Success() throws Exception {
    // Arrange
    int communityId = 1;
    ActivityHeatmap heatmapEntry = new ActivityHeatmap(10, 2, 50);
    List<ActivityHeatmap> heatmap = Arrays.asList(heatmapEntry, heatmapEntry, heatmapEntry);
    when(communityService.getCommunityActivityHeatmap(communityId)).thenReturn(heatmap);

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/heatmap", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(communityService, times(1)).getCommunityActivityHeatmap(communityId);
  }

  @Test
  void testGetAllCommunities_ReturnsEmptyList() throws Exception {
    // Arrange
    when(communityService.listAllCommunities()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/community/list").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(communityService, times(1)).listAllCommunities();
  }

  @Test
  void testGetAllCommunities_ServiceThrowsException() throws Exception {
    // Arrange
    when(communityService.listAllCommunities())
        .thenThrow(new RuntimeException("Database connection error"));

    // Act & Assert
    mockMvc
        .perform(get("/community/list").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(communityService, times(1)).listAllCommunities();
  }

  @Test
  void testGetCommunities_WithNegativePageParameter() throws Exception {
    // Arrange
    when(communityService.listCommunities(-1, 25))
        .thenThrow(new IllegalArgumentException("Page number cannot be negative"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/list-slow")
                .param("page", "-1")
                .param("size", "25")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Page number cannot be negative"));

    verify(communityService, times(1)).listCommunities(-1, 25);
  }

  @Test
  void testGetCommunities_WithNegativeSizeParameter() throws Exception {
    // Arrange
    when(communityService.listCommunities(0, -10))
        .thenThrow(new IllegalArgumentException("Size must be positive"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/list-slow")
                .param("page", "0")
                .param("size", "-10")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Size must be positive"));

    verify(communityService, times(1)).listCommunities(0, -10);
  }

  @Test
  void testGetCommunities_ReturnsEmptyList() throws Exception {
    // Arrange
    when(communityService.listCommunities(10, 25)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(
            get("/community/list-slow")
                .param("page", "10")
                .param("size", "25")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(communityService, times(1)).listCommunities(10, 25);
  }

  @Test
  void testGetTopCommunityIds_WithZeroLimit() throws Exception {
    // Arrange
    when(communityService.getTopCommunityIds(0))
        .thenThrow(new IllegalArgumentException("Limit must be greater than 0"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/top-ids").param("limit", "0").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Limit must be greater than 0"));

    verify(communityService, times(1)).getTopCommunityIds(0);
  }

  @Test
  void testGetTopCommunityIds_WithNegativeLimit() throws Exception {
    // Arrange
    when(communityService.getTopCommunityIds(-5))
        .thenThrow(new IllegalArgumentException("Limit cannot be negative"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/top-ids").param("limit", "-5").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Limit cannot be negative"));

    verify(communityService, times(1)).getTopCommunityIds(-5);
  }

  @Test
  void testGetTopCommunityIds_ReturnsEmptyList() throws Exception {
    // Arrange
    when(communityService.getTopCommunityIds(10)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/community/top-ids")
                .param("limit", "10")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(communityService, times(1)).getTopCommunityIds(10);
  }

  @Test
  void testGetCommunityOverview_ServiceThrowsException() throws Exception {
    // Arrange
    when(communityService.getCommunityOverview())
        .thenThrow(new RuntimeException("Failed to calculate overview"));

    // Act & Assert
    mockMvc
        .perform(get("/community/overview").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(communityService, times(1)).getCommunityOverview();
  }

  @Test
  void testGetCommunitySummaryById_NotFound() throws Exception {
    // Arrange
    int communityId = 999;
    when(communityService.getCommunitySummary(communityId))
        .thenThrow(new EntityNotFoundException("Community with id " + communityId + " not found"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/summary/{communityId}", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Community with id 999 not found"));

    verify(communityService, times(1)).getCommunitySummary(communityId);
  }

  @Test
  void testGetCommunitySummaryById_WithNegativeId() throws Exception {
    // Arrange
    int communityId = -1;
    when(communityService.getCommunitySummary(communityId))
        .thenThrow(new IllegalArgumentException("Community ID must be positive"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/summary/{communityId}", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Community ID must be positive"));

    verify(communityService, times(1)).getCommunitySummary(communityId);
  }

  @Test
  void testGetAuthorsWithGivenCommunityId_CommunityNotFound() throws Exception {
    // Arrange
    int communityId = 999;
    when(communityService.getAuthorsWithCommunityId(communityId))
        .thenThrow(new EntityNotFoundException("Community with id " + communityId + " not found"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/authors", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Community with id 999 not found"));

    verify(communityService, times(1)).getAuthorsWithCommunityId(communityId);
  }

  @Test
  void testGetAuthorsWithGivenCommunityId_ReturnsEmptyList() throws Exception {
    // Arrange
    int communityId = 5;
    when(communityService.getAuthorsWithCommunityId(communityId))
        .thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/authors", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(communityService, times(1)).getAuthorsWithCommunityId(communityId);
  }

  @Test
  void testGetAuthorsWithGivenCommunityId_WithInvalidIdType() throws Exception {
    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/authors", "invalid")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }

  @Test
  void testGetCommunityActivityHeatMap_CommunityNotFound() throws Exception {
    // Arrange
    int communityId = 999;
    when(communityService.getCommunityActivityHeatmap(communityId))
        .thenThrow(new EntityNotFoundException("Community with id " + communityId + " not found"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/heatmap", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Community with id 999 not found"));

    verify(communityService, times(1)).getCommunityActivityHeatmap(communityId);
  }

  @Test
  void testGetCommunityActivityHeatMap_ReturnsEmptyList() throws Exception {
    // Arrange
    int communityId = 5;
    when(communityService.getCommunityActivityHeatmap(communityId))
        .thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/heatmap", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(communityService, times(1)).getCommunityActivityHeatmap(communityId);
  }

  @Test
  void testGetCommunityActivityHeatMap_ServiceThrowsRuntimeException() throws Exception {
    // Arrange
    int communityId = 1;
    when(communityService.getCommunityActivityHeatmap(communityId))
        .thenThrow(new RuntimeException("Database query failed"));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{communityId}/heatmap", communityId)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(communityService, times(1)).getCommunityActivityHeatmap(communityId);
  }

  @Test
  void testGetProjectCommunityMetricConfig_Success() throws Exception {
    // Arrange
    String projectName = "TestProject";
    MetricConfig metricConfig =
        new MetricConfig(
            MetricType.COMMUNITY,
            Set.of(NodeType.AUTHOR),
            Set.of(RelationType.RETWEETS),
            Orientation.NATURAL);
    when(communityService.getProjectCommunityMetricConfig(projectName))
        .thenReturn(Optional.of(metricConfig));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{projectName}/metric-config", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.type").value("COMMUNITY"))
        .andExpect(jsonPath("$.nodeTypes[0]").value("AUTHOR"))
        .andExpect(jsonPath("$.relationTypes[0]").value("RETWEETS"))
        .andExpect(jsonPath("$.orientation").value("NATURAL"));

    verify(communityService, times(1)).getProjectCommunityMetricConfig(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_NotFound() throws Exception {
    // Arrange
    String projectName = "TestProject";
    when(communityService.getProjectCommunityMetricConfig(projectName))
        .thenReturn(Optional.empty());

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{projectName}/metric-config", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());

    verify(communityService, times(1)).getProjectCommunityMetricConfig(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_ProjectNotFound() throws Exception {
    // Arrange
    String projectName = "NonExistentProject";
    when(communityService.getProjectCommunityMetricConfig(projectName))
        .thenThrow(
            new ProjectException(
                "Project with name '" + projectName + "' does not exist",
                org.springframework.http.HttpStatus.NOT_FOUND));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{projectName}/metric-config", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").exists());

    verify(communityService, times(1)).getProjectCommunityMetricConfig(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_WithMultipleNodeTypes() throws Exception {
    // Arrange
    String projectName = "TestProject";
    MetricConfig metricConfig =
        new MetricConfig(
            MetricType.COMMUNITY,
            Set.of(NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG),
            Set.of(RelationType.RETWEETS, RelationType.MENTIONS),
            Orientation.UNDIRECTED);
    when(communityService.getProjectCommunityMetricConfig(projectName))
        .thenReturn(Optional.of(metricConfig));

    // Act & Assert
    mockMvc
        .perform(
            get("/community/{projectName}/metric-config", projectName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodeTypes").isArray())
        .andExpect(jsonPath("$.nodeTypes.length()").value(3))
        .andExpect(jsonPath("$.relationTypes.length()").value(2))
        .andExpect(jsonPath("$.orientation").value("UNDIRECTED"));

    verify(communityService, times(1)).getProjectCommunityMetricConfig(projectName);
  }
}

