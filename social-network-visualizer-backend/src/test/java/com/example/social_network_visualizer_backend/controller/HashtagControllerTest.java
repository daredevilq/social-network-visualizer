package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagProfileDto;
import com.example.social_network_visualizer_backend.service.HashtagService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(HashtagController.class)
class HashtagControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private HashtagService hashtagService;

  @Test
  void testGetHashtagDetails_Success() throws Exception {
    // Arrange
    String hashtagName = "testHashtag";
    HashtagDetailsDto hashtagDetails = new HashtagDetailsDto("testHashtag", List.of(), List.of());
    when(hashtagService.getHashtagDetails(hashtagName, 5, 3)).thenReturn(hashtagDetails);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/sidebarDetails", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 5, 3);
  }

  @Test
  void testGetHashtagDetails_WithDifferentHashtags() throws Exception {
    // Arrange
    String hashtagName = "trending";
    HashtagDetailsDto hashtagDetails = new HashtagDetailsDto("trending", List.of(), List.of());
    when(hashtagService.getHashtagDetails(hashtagName, 5, 3)).thenReturn(hashtagDetails);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/sidebarDetails", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 5, 3);
  }

  @Test
  void testGetHashtagDetails_WithSpecialCharacters() throws Exception {
    // Arrange
    String hashtagName = "test_hashtag";
    HashtagDetailsDto hashtagDetails = new HashtagDetailsDto("test_hashtag", List.of(), List.of());
    when(hashtagService.getHashtagDetails(hashtagName, 5, 3)).thenReturn(hashtagDetails);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/sidebarDetails", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 5, 3);
  }

  @Test
  void testGetHashtagDetails_HashtagNotFound() throws Exception {
    // Arrange
    String hashtagName = "nonExistentHashtag";
    when(hashtagService.getHashtagDetails(hashtagName, 5, 3))
        .thenThrow(new EntityNotFoundException("Hashtag not found: " + hashtagName));

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/sidebarDetails", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Hashtag not found: " + hashtagName));

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 5, 3);
  }

  @Test
  void testGetHashtagDetails_ServiceThrowsException() throws Exception {
    // Arrange
    String hashtagName = "problematicHashtag";
    when(hashtagService.getHashtagDetails(hashtagName, 5, 3))
        .thenThrow(new RuntimeException("Database error"));

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/sidebarDetails", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 5, 3);
  }

  @Test
  void testGetHashtagDetails_EmptyHashtagName() throws Exception {
    // Arrange
    String hashtagName = "";

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/sidebarDetails", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  void testGetHashtagProfile_Success() throws Exception {
    // Arrange
    String hashtagName = "java";
    HashtagProfileDto profile =
        HashtagProfileDto.builder()
            .name(hashtagName)
            .totalUsage(100L)
            .uniqueUsers(50L)
            .totalRetweets(25L)
            .build();
    when(hashtagService.getHashtagProfile(hashtagName)).thenReturn(profile);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/profile", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value(hashtagName))
        .andExpect(jsonPath("$.totalUsage").value(100))
        .andExpect(jsonPath("$.uniqueUsers").value(50))
        .andExpect(jsonPath("$.totalRetweets").value(25));

    verify(hashtagService, times(1)).getHashtagProfile(hashtagName);
  }

  @Test
  void testGetHashtagProfile_NotFound() throws Exception {
    // Arrange
    String hashtagName = "nonexistent";
    when(hashtagService.getHashtagProfile(hashtagName)).thenReturn(null);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/profile", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(hashtagService, times(1)).getHashtagProfile(hashtagName);
  }

  @Test
  void testGetHashtagTopAuthorsAndTweets_Success() throws Exception {
    // Arrange
    String hashtagName = "trending";
    HashtagDetailsDto details = new HashtagDetailsDto(hashtagName, List.of(), List.of());
    when(hashtagService.getHashtagDetails(hashtagName, 10, 10)).thenReturn(details);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/top-tweets-and-authors", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hashtag").value(hashtagName));

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 10, 10);
  }

  @Test
  void testGetHashtagTopAuthorsAndTweets_ServiceThrowsException() throws Exception {
    // Arrange
    String hashtagName = "error";
    when(hashtagService.getHashtagDetails(hashtagName, 10, 10))
        .thenThrow(new RuntimeException("Database error"));

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/top-tweets-and-authors", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(hashtagService, times(1)).getHashtagDetails(hashtagName, 10, 10);
  }

  @Test
  void testGetHashtagActivity_Success() throws Exception {
    // Arrange
    String hashtagName = "java";
    Map<String, Long> activity = new HashMap<>();
    activity.put("2024-01", 10L);
    activity.put("2024-02", 15L);
    when(hashtagService.getHashtagActivity(hashtagName)).thenReturn(activity);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/activity", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$['2024-01']").value(10))
        .andExpect(jsonPath("$['2024-02']").value(15));

    verify(hashtagService, times(1)).getHashtagActivity(hashtagName);
  }

  @Test
  void testGetHashtagActivity_EmptyActivity() throws Exception {
    // Arrange
    String hashtagName = "inactive";
    when(hashtagService.getHashtagActivity(hashtagName)).thenReturn(new HashMap<>());

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/activity", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());

    verify(hashtagService, times(1)).getHashtagActivity(hashtagName);
  }

  @Test
  void testGetHashtagMostCommonWords_Success() throws Exception {
    // Arrange
    String hashtagName = "programming";
    Map<String, Long> words = new HashMap<>();
    words.put("java", 50L);
    words.put("python", 30L);
    when(hashtagService.findMostCommonWords(hashtagName)).thenReturn(words);

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/most-common-words", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.java").value(50))
        .andExpect(jsonPath("$.python").value(30));

    verify(hashtagService, times(1)).findMostCommonWords(hashtagName);
  }

  @Test
  void testGetHashtagMostCommonWords_EmptyResult() throws Exception {
    // Arrange
    String hashtagName = "empty";
    when(hashtagService.findMostCommonWords(hashtagName)).thenReturn(new HashMap<>());

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/most-common-words", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());

    verify(hashtagService, times(1)).findMostCommonWords(hashtagName);
  }

  @Test
  void testGetHashtagMostCommonWords_ServiceThrowsException() throws Exception {
    // Arrange
    String hashtagName = "error";
    when(hashtagService.findMostCommonWords(hashtagName))
        .thenThrow(new RuntimeException("Processing error"));

    // Act & Assert
    mockMvc
        .perform(
            get("/hashtag/{hashtagName}/most-common-words", hashtagName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(hashtagService, times(1)).findMostCommonWords(hashtagName);
  }
}
