package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;
import com.example.social_network_visualizer_backend.dto.ProjectStatsDto;
import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.service.DashboardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private DashboardService dashboardService;

  @Test
  void testGetProjectData_Success() throws Exception {
    // Arrange
    ProjectStatsDto projectStats = new ProjectStatsDto(1000L, 500L, 100L, 2000L, 50L, 300L);
    when(dashboardService.getProjectStats()).thenReturn(projectStats);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/project-stats").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(dashboardService, times(1)).getProjectStats();
  }

  @Test
  void testGetProjectActivity_Success() throws Exception {
    // Arrange
    ActivityPoint activityPoint = new ActivityPoint(java.time.LocalDate.of(2024, 1, 1), 100L);
    List<ActivityPoint> activityPoints = Arrays.asList(activityPoint, activityPoint, activityPoint);
    when(dashboardService.getProjectActivity()).thenReturn(activityPoints);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/activity").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(dashboardService, times(1)).getProjectActivity();
  }

  @Test
  void testGetProjectHashtags_Success() throws Exception {
    // Arrange
    HashtagFrequency hashtag = new HashtagFrequency("testHashtag", 10);
    List<HashtagFrequency> hashtags = Arrays.asList(hashtag, hashtag);
    when(dashboardService.getProjectHashtagStats()).thenReturn(hashtags);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/hashtags").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(dashboardService, times(1)).getProjectHashtagStats();
  }

  @Test
  void testGetProjectViralTweets_Success() throws Exception {
    // Arrange
    ViralTweetDto viralTweet = new ViralTweetDto("testUser", "tweet123", "Test preview", "http://test.com", 100, 50, 20, 170);
    List<ViralTweetDto> viralTweets = Arrays.asList(viralTweet, viralTweet);
    when(dashboardService.getViralTweetStats()).thenReturn(viralTweets);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/viral-tweets").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(dashboardService, times(1)).getViralTweetStats();
  }

  @Test
  void testGetProjectTopMentionsUsers_Success() throws Exception {
    // Arrange
    TopAuthorsDto topAuthor = new TopAuthorsDto("testUser", 50);
    List<TopAuthorsDto> topAuthors = Arrays.asList(topAuthor, topAuthor, topAuthor);
    when(dashboardService.getTopMentions()).thenReturn(topAuthors);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/top-mentions").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(dashboardService, times(1)).getTopMentions();
  }

  @Test
  void testGetProjectTopAuthors_Success() throws Exception {
    // Arrange
    TopAuthorsDto topAuthor = new TopAuthorsDto("testUser", 50);
    List<TopAuthorsDto> topAuthors = Arrays.asList(topAuthor, topAuthor);
    when(dashboardService.getTopAuthors()).thenReturn(topAuthors);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/top-authors").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(dashboardService, times(1)).getTopAuthors();
  }

  @Test
  void testGetProjectHeatMap_Success() throws Exception {
    // Arrange
    ActivityHeatmap heatmapEntry = new ActivityHeatmap(10, 2, 50);
    List<ActivityHeatmap> heatmap = Arrays.asList(heatmapEntry, heatmapEntry);
    when(dashboardService.getHeatMap()).thenReturn(heatmap);

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/heat-map").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(dashboardService, times(1)).getHeatMap();
  }

  @Test
  void testGetProjectStats_ServiceThrowsException() throws Exception {
    // Arrange
    when(dashboardService.getProjectStats())
        .thenThrow(new RuntimeException("Database connection error"));

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/project-stats").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(dashboardService, times(1)).getProjectStats();
  }

  @Test
  void testGetActivityTimeline_EmptyResult() throws Exception {
    // Arrange
    when(dashboardService.getProjectActivity()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/activity").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(dashboardService, times(1)).getProjectActivity();
  }

  @Test
  void testGetActivityTimeline_ServiceThrowsException() throws Exception {
    // Arrange
    when(dashboardService.getProjectActivity())
        .thenThrow(new RuntimeException("Failed to fetch activity timeline"));

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/activity").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(dashboardService, times(1)).getProjectActivity();
  }

  @Test
  void testGetTopHashtags_EmptyResult() throws Exception {
    // Arrange
    when(dashboardService.getProjectHashtagStats()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/hashtags").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(dashboardService, times(1)).getProjectHashtagStats();
  }

  @Test
  void testGetTopHashtags_ServiceThrowsException() throws Exception {
    // Arrange
    when(dashboardService.getProjectHashtagStats())
        .thenThrow(new RuntimeException("Failed to fetch top hashtags"));

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/hashtags").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(dashboardService, times(1)).getProjectHashtagStats();
  }

  @Test
  void testGetMostViralTweets_EmptyResult() throws Exception {
    // Arrange
    when(dashboardService.getViralTweetStats()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/viral-tweets").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(dashboardService, times(1)).getViralTweetStats();
  }

  @Test
  void testGetMostViralTweets_ServiceThrowsException() throws Exception {
    // Arrange
    when(dashboardService.getViralTweetStats())
        .thenThrow(new RuntimeException("Failed to fetch viral tweets"));

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/viral-tweets").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(dashboardService, times(1)).getViralTweetStats();
  }

  @Test
  void testGetTopAuthors_EmptyResult() throws Exception {
    // Arrange
    when(dashboardService.getTopAuthors()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/top-authors").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(dashboardService, times(1)).getTopAuthors();
  }

  @Test
  void testGetTopAuthors_ServiceThrowsException() throws Exception {
    // Arrange
    when(dashboardService.getTopAuthors())
        .thenThrow(new RuntimeException("Failed to fetch top authors"));

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/top-authors").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(dashboardService, times(1)).getTopAuthors();
  }

  @Test
  void testGetProjectHeatMap_EmptyResult() throws Exception {
    // Arrange
    when(dashboardService.getHeatMap()).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/heat-map").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(dashboardService, times(1)).getHeatMap();
  }

  @Test
  void testGetProjectHeatMap_ServiceThrowsException() throws Exception {
    // Arrange
    when(dashboardService.getHeatMap())
        .thenThrow(new RuntimeException("Failed to generate heatmap"));

    // Act & Assert
    mockMvc
        .perform(get("/dashboard/heat-map").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(dashboardService, times(1)).getHeatMap();
  }
}

