package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.tweet.PaginatedTweetsDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetDetailsDto;
import com.example.social_network_visualizer_backend.service.TweetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TweetController.class)
class TweetControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private TweetService tweetService;

  @Test
  void testGetTweetDetails_Success() throws Exception {
    // Arrange
    String tweetId = "tweet123";
    TweetDetailsDto tweetDetails =
        new TweetDetailsDto(
            "tweet123",
            "http://test.com",
            "testAuthor",
            "Test content",
            List.of(),
            List.of(),
            10L,
            5L,
            2L,
            0.5,
            false,
            "en",
            "tweet",
            List.of(),
            List.of(),
            null,
            null);
    when(tweetService.getTweetDetails(tweetId)).thenReturn(tweetDetails);

    // Act & Assert
    mockMvc
        .perform(get("/tweet/{tweetId}", tweetId).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1)).getTweetDetails(tweetId);
  }

  @Test
  void testGetTenTweetsByAuthor_WithAllParameters() throws Exception {
    // Arrange
    String userName = "testUser";
    Integer page = 1;
    Integer limit = 10;
    String search = "test";
    String sortBy = "date";
    String order = "desc";
    List<String> hashtags = Arrays.asList("tag1", "tag2");
    Boolean highEngagement = false;
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);

    when(tweetService.getRecentTweets(
            userName, page, limit, search, sortBy, order, hashtags, highEngagement))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("userName", userName)
                .param("page", String.valueOf(page))
                .param("limit", String.valueOf(limit))
                .param("search", search)
                .param("sortBy", sortBy)
                .param("order", order)
                .param("hashtags", "tag1", "tag2")
                .param("highEngagement", String.valueOf(highEngagement))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(userName, page, limit, search, sortBy, order, hashtags, highEngagement);
  }

  @Test
  void testGetTenTweetsByAuthor_WithDefaultParameters() throws Exception {
    // Arrange
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);
    when(tweetService.getRecentTweets(null, 1, 10, "", "date", "desc", Arrays.asList(), false))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(get("/tweet/list/all").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(null, 1, 10, "", "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTenTweetsByAuthor_WithUserNameOnly() throws Exception {
    // Arrange
    String userName = "testUser";
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);
    when(tweetService.getRecentTweets(userName, 1, 10, "", "date", "desc", Arrays.asList(), false))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("userName", userName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(userName, 1, 10, "", "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTenTweetsByAuthor_WithHighEngagement() throws Exception {
    // Arrange
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);
    when(tweetService.getRecentTweets(null, 1, 10, "", "date", "desc", Arrays.asList(), true))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("highEngagement", "true")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(null, 1, 10, "", "date", "desc", Arrays.asList(), true);
  }

  @Test
  void testGetTenTweetsByAuthor_WithSearchTerm() throws Exception {
    // Arrange
    String search = "important";
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);
    when(tweetService.getRecentTweets(null, 1, 10, search, "date", "desc", Arrays.asList(), false))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all").param("search", search).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(null, 1, 10, search, "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTenTweetsByAuthor_WithCustomSortAndOrder() throws Exception {
    // Arrange
    String sortBy = "engagement";
    String order = "asc";
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);
    when(tweetService.getRecentTweets(null, 1, 10, "", sortBy, order, Arrays.asList(), false))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("sortBy", sortBy)
                .param("order", order)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(null, 1, 10, "", sortBy, order, Arrays.asList(), false);
  }

  @Test
  void testGetTenTweetsByAuthor_WithPagination() throws Exception {
    // Arrange
    Integer page = 2;
    Integer limit = 20;
    PaginatedTweetsDto paginatedTweets = new PaginatedTweetsDto(List.of(), 0, 0, 0);
    when(tweetService.getRecentTweets(
            null, page, limit, "", "date", "desc", Arrays.asList(), false))
        .thenReturn(paginatedTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("page", String.valueOf(page))
                .param("limit", String.valueOf(limit))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(tweetService, times(1))
        .getRecentTweets(null, page, limit, "", "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTweetDetails_TweetNotFound() throws Exception {
    // Arrange
    String tweetId = "999";
    when(tweetService.getTweetDetails(tweetId))
        .thenThrow(new EntityNotFoundException("Tweet not found with id: " + tweetId));

    // Act & Assert
    mockMvc
        .perform(get("/tweet/{tweetId}", tweetId).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Tweet not found with id: " + tweetId));

    verify(tweetService, times(1)).getTweetDetails(tweetId);
  }

  @Test
  void testGetTweetDetails_InvalidTweetId() throws Exception {
    // Arrange
    String invalidId = "notANumber";

    // Act & Assert
    mockMvc
        .perform(get("/tweet/{tweetId}", invalidId).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  void testGetTweetDetails_ServiceThrowsException() throws Exception {
    // Arrange
    String tweetId = "1";
    when(tweetService.getTweetDetails(tweetId))
        .thenThrow(new RuntimeException("Database connection error"));

    // Act & Assert
    mockMvc
        .perform(get("/tweet/{tweetId}", tweetId).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(tweetService, times(1)).getTweetDetails(tweetId);
  }

  @Test
  void testGetTweetsPaginated_EmptyResult() throws Exception {
    // Arrange
    int page = 5;
    int limit = 10;
    PaginatedTweetsDto emptyPagination =
        new PaginatedTweetsDto(Collections.emptyList(), 0, page, limit);
    when(tweetService.getRecentTweets(
            null, page, limit, "", "date", "desc", Arrays.asList(), false))
        .thenReturn(emptyPagination);

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("page", String.valueOf(page))
                .param("limit", String.valueOf(limit))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tweets").isArray())
        .andExpect(jsonPath("$.tweets.length()").value(0))
        .andExpect(jsonPath("$.total").value(0));

    verify(tweetService, times(1))
        .getRecentTweets(null, page, limit, "", "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTweetsPaginated_InvalidPageNumber() throws Exception {
    // Arrange
    int page = -1;
    int limit = 10;
    when(tweetService.getRecentTweets(
            null, page, limit, "", "date", "desc", Arrays.asList(), false))
        .thenThrow(new IllegalArgumentException("Page number must be non-negative"));

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("page", String.valueOf(page))
                .param("limit", String.valueOf(limit))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Page number must be non-negative"));

    verify(tweetService, times(1))
        .getRecentTweets(null, page, limit, "", "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTweetsPaginated_InvalidLimit() throws Exception {
    // Arrange
    int page = 0;
    int limit = 0;
    when(tweetService.getRecentTweets(
            null, page, limit, "", "date", "desc", Arrays.asList(), false))
        .thenThrow(new IllegalArgumentException("Limit must be positive"));

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("page", String.valueOf(page))
                .param("limit", String.valueOf(limit))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Limit must be positive"));

    verify(tweetService, times(1))
        .getRecentTweets(null, page, limit, "", "date", "desc", Arrays.asList(), false);
  }

  @Test
  void testGetTweetsPaginated_ServiceThrowsException() throws Exception {
    // Arrange
    int page = 0;
    int limit = 10;
    when(tweetService.getRecentTweets(
            null, page, limit, "", "date", "desc", Arrays.asList(), false))
        .thenThrow(new RuntimeException("Database error"));

    // Act & Assert
    mockMvc
        .perform(
            get("/tweet/list/all")
                .param("page", String.valueOf(page))
                .param("limit", String.valueOf(limit))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(tweetService, times(1))
        .getRecentTweets(null, page, limit, "", "date", "desc", Arrays.asList(), false);
  }
}
