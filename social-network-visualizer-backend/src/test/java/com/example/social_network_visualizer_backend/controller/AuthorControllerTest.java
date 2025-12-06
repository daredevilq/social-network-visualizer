package com.example.social_network_visualizer_backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.author.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.author.TweetPreviewDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.service.AuthorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthorController.class)
class AuthorControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private AuthorService authorService;

  @Test
  void testGetAuthor_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    Tweet tweet = new Tweet();
    tweet.setId("tweet123");
    tweet.setContent("Test tweet content");
    List<Tweet> tweets = Arrays.asList(tweet);
    when(authorService.findLast10TweetsByAuthor(authorName)).thenReturn(tweets);

    // Act & Assert
    mockMvc
        .perform(get("/author/all/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());

    verify(authorService, times(1)).findLast10TweetsByAuthor(authorName);
  }

  @Test
  void testFindAuthorById_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    AuthorDataResponse authorData = new AuthorDataResponse("testAuthor", "2024-01-01", 100L, 50L, 200L, 30L, 2.5, 5.0, 10.0);
    when(authorService.findAuthorById(authorName)).thenReturn(authorData);

    // Act & Assert
    mockMvc
        .perform(get("/author/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    verify(authorService, times(1)).findAuthorById(authorName);
  }

  @Test
  void testGetAuthorActivity_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    Map<String, Long> activity = new HashMap<>();
    activity.put("2024-01", 10L);
    activity.put("2024-02", 15L);
    when(authorService.getAuthorActivity(authorName)).thenReturn(activity);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/activity/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.['2024-01']").value(10))
        .andExpect(jsonPath("$.['2024-02']").value(15));

    verify(authorService, times(1)).getAuthorActivity(authorName);
  }

  @Test
  void testGetLast3TweetUrls_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    TweetPreviewDto preview = new TweetPreviewDto();
    List<TweetPreviewDto> previews = Arrays.asList(preview, preview, preview);
    when(authorService.findLast3TweetUrlsByAuthor(authorName)).thenReturn(previews);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/last-posts/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(authorService, times(1)).findLast3TweetUrlsByAuthor(authorName);
  }

  @Test
  void testGetTopHashtags_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    HashtagFrequency hashtag = new HashtagFrequency("testHashtag", 10);
    List<HashtagFrequency> hashtags = Arrays.asList(hashtag, hashtag);
    when(authorService.findTopHashtagsByAuthor(authorName)).thenReturn(hashtags);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/hashtags/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(authorService, times(1)).findTopHashtagsByAuthor(authorName);
  }

  @Test
  void testGetMentionedAuthors_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    List<String> mentions = Arrays.asList("user1", "user2", "user3");
    when(authorService.findMentionsAuthorsByAuthor(authorName)).thenReturn(mentions);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/mentions/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(authorService, times(1)).findMentionsAuthorsByAuthor(authorName);
  }

  @Test
  void testGetTweetsContent_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    Map<String, Long> words = Map.of("word1", 10L, "word2", 8L, "word3", 5L);
    when(authorService.findMostCommonWords(authorName)).thenReturn(words);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/most-common-words/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.word1").value(10))
        .andExpect(jsonPath("$.word2").value(8))
        .andExpect(jsonPath("$.word3").value(5));

    verify(authorService, times(1)).findMostCommonWords(authorName);
  }

  @Test
  void testGetAuthorRetweets_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    List<String> retweets = Arrays.asList("rt1", "rt2");
    when(authorService.findAuthorRetweets(authorName)).thenReturn(retweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/retweets-by/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(authorService, times(1)).findAuthorRetweets(authorName);
  }

  @Test
  void testGetRetweetsByAuthors_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    List<String> retweets = Arrays.asList("rt1", "rt2", "rt3");
    when(authorService.findRetweetsByAuthor(authorName)).thenReturn(retweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/retweets-of/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(authorService, times(1)).findRetweetsByAuthor(authorName);
  }

  @Test
  void testGetViralTweets_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    ViralTweetDto viralTweet = new ViralTweetDto("testUser", "tweet123", "Test preview", "http://test.com", 100, 50, 20, 170);
    List<ViralTweetDto> viralTweets = Arrays.asList(viralTweet, viralTweet);
    when(authorService.findTheMostViralTweet(authorName)).thenReturn(viralTweets);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/viral-tweets/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(authorService, times(1)).findTheMostViralTweet(authorName);
  }

  @Test
  void testGetAuthorActivityHeatmap_Success() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    ActivityHeatmap heatmapEntry = new ActivityHeatmap(10, 2, 50);
    List<ActivityHeatmap> heatmap = Arrays.asList(heatmapEntry, heatmapEntry);
    when(authorService.getAuthorActivityHeatmap(authorName)).thenReturn(heatmap);

    // Act & Assert
    mockMvc
        .perform(
            get("/author/heatmap/{authorName}", authorName)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(authorService, times(1)).getAuthorActivityHeatmap(authorName);
  }

  @Test
  void testGetAuthor_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findLast10TweetsByAuthor(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/all/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findLast10TweetsByAuthor(authorName);
  }

  @Test
  void testGetAuthor_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoTweets";
    when(authorService.findLast10TweetsByAuthor(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/all/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).findLast10TweetsByAuthor(authorName);
  }

  @Test
  void testFindAuthorById_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findAuthorById(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findAuthorById(authorName);
  }

  @Test
  void testGetAuthorActivity_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.getAuthorActivity(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/activity/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).getAuthorActivity(authorName);
  }

  @Test
  void testGetAuthorActivity_ReturnsEmptyMap() throws Exception {
    // Arrange
    String authorName = "authorWithNoActivity";
    when(authorService.getAuthorActivity(authorName)).thenReturn(Collections.emptyMap());

    // Act & Assert
    mockMvc
        .perform(get("/author/activity/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());

    verify(authorService, times(1)).getAuthorActivity(authorName);
  }

  @Test
  void testGetLast3TweetUrls_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findLast3TweetUrlsByAuthor(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/last-posts/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findLast3TweetUrlsByAuthor(authorName);
  }

  @Test
  void testGetLast3TweetUrls_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoTweets";
    when(authorService.findLast3TweetUrlsByAuthor(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/last-posts/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).findLast3TweetUrlsByAuthor(authorName);
  }

  @Test
  void testGetTopHashtags_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findTopHashtagsByAuthor(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/hashtags/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findTopHashtagsByAuthor(authorName);
  }

  @Test
  void testGetTopHashtags_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoHashtags";
    when(authorService.findTopHashtagsByAuthor(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/hashtags/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).findTopHashtagsByAuthor(authorName);
  }

  @Test
  void testGetMentionedAuthors_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findMentionsAuthorsByAuthor(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/mentions/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findMentionsAuthorsByAuthor(authorName);
  }

  @Test
  void testGetMentionedAuthors_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoMentions";
    when(authorService.findMentionsAuthorsByAuthor(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/mentions/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).findMentionsAuthorsByAuthor(authorName);
  }

  @Test
  void testGetTweetsContent_ServiceThrowsException() throws Exception {
    // Arrange
    String authorName = "testAuthor";
    when(authorService.findMostCommonWords(authorName))
        .thenThrow(new RuntimeException("Failed to analyze content"));

    // Act & Assert
    mockMvc
        .perform(get("/author/most-common-words/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(authorService, times(1)).findMostCommonWords(authorName);
  }

  @Test
  void testGetAuthorRetweets_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoRetweets";
    when(authorService.findAuthorRetweets(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/retweets-by/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).findAuthorRetweets(authorName);
  }

  @Test
  void testGetRetweetsByAuthors_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findRetweetsByAuthor(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/retweets-of/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findRetweetsByAuthor(authorName);
  }

  @Test
  void testGetViralTweets_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.findTheMostViralTweet(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/viral-tweets/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).findTheMostViralTweet(authorName);
  }

  @Test
  void testGetViralTweets_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoViralTweets";
    when(authorService.findTheMostViralTweet(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/viral-tweets/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).findTheMostViralTweet(authorName);
  }

  @Test
  void testGetAuthorActivityHeatmap_AuthorNotFound() throws Exception {
    // Arrange
    String authorName = "nonExistentAuthor";
    when(authorService.getAuthorActivityHeatmap(authorName))
        .thenThrow(new EntityNotFoundException("Author not found: " + authorName));

    // Act & Assert
    mockMvc
        .perform(get("/author/heatmap/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Author not found: " + authorName));

    verify(authorService, times(1)).getAuthorActivityHeatmap(authorName);
  }

  @Test
  void testGetAuthorActivityHeatmap_ReturnsEmptyList() throws Exception {
    // Arrange
    String authorName = "authorWithNoActivity";
    when(authorService.getAuthorActivityHeatmap(authorName)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/author/heatmap/{authorName}", authorName).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(authorService, times(1)).getAuthorActivityHeatmap(authorName);
  }
}

