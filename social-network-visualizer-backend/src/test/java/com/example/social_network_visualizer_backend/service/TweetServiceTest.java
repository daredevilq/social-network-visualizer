package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.tweet.PaginatedTweetsDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetDetailsDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetWithStats;
import com.example.social_network_visualizer_backend.enums.TweetSortOption;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TweetServiceTest {

  @Mock private TweetRepository tweetRepository;

  @Mock private AuthorRepository authorRepository;

  @InjectMocks private TweetService tweetService;

  @Test
  void testGetRecentTweets_Success() {
    // Arrange
    String authorName = "testUser";
    Integer page = 1;
    Integer limit = 10;
    Author author = new Author();
    author.setUserName(authorName);

    List<TweetWithStats> tweets = createTweetList(15);

    when(authorRepository.findAuthorByUserName(authorName)).thenReturn(Optional.of(author));
    when(tweetRepository.findTweetsWithRelationships(
            authorName, null, TweetSortOption.DATE, "DESC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(authorName, page, limit, null, "DATE", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(10, result.tweets().size());
    assertEquals(15, result.total());
    assertEquals(1, result.page());
    assertEquals(2, result.totalPages());
    verify(authorRepository).findAuthorByUserName(authorName);
    verify(tweetRepository)
        .findTweetsWithRelationships(authorName, null, TweetSortOption.DATE, "DESC", null, null);
  }

  @Test
  void testGetRecentTweets_WithoutAuthorName() {
    // Arrange
    Integer page = 1;
    Integer limit = 5;
    List<TweetWithStats> tweets = createTweetList(3);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "ASC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "ASC", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.tweets().size());
    assertEquals(3, result.total());
    assertEquals(1, result.page());
    assertEquals(1, result.totalPages());
    verify(authorRepository, never()).findAuthorByUserName(anyString());
  }

  @Test
  void testGetRecentTweets_AuthorNotFound() {
    // Arrange
    String authorName = "nonExistentUser";
    when(authorRepository.findAuthorByUserName(authorName)).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(
        EntityNotFoundException.class,
        () -> tweetService.getRecentTweets(authorName, 1, 10, null, "DATE", "DESC", null, null));
    verify(authorRepository).findAuthorByUserName(authorName);
    verify(tweetRepository, never())
        .findTweetsWithRelationships(anyString(), any(), any(), any(), any(), any());
  }

  @Test
  void testGetRecentTweets_InvalidPage() {
    // Arrange
    Integer page = 0;
    Integer limit = 10;

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null));
  }

  @Test
  void testGetRecentTweets_InvalidLimit() {
    // Arrange
    Integer page = 1;
    Integer limit = 0;

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null));
  }

  @Test
  void testGetRecentTweets_NegativeLimit() {
    // Arrange
    Integer page = 1;
    Integer limit = -5;

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null));
  }

  @Test
  void testGetRecentTweets_InvalidOrderDirection() {
    // Arrange
    Integer page = 1;
    Integer limit = 10;

    // Act & Assert
    assertThrows(
        IllegalArgumentException.class,
        () -> tweetService.getRecentTweets(null, page, limit, null, "DATE", "invalid", null, null));
  }

  @Test
  void testGetRecentTweets_PageBeyondTotalPages() {
    // Arrange
    Integer page = 10;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(5);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertTrue(result.tweets().isEmpty());
    assertEquals(5, result.total());
    assertEquals(10, result.page());
    assertEquals(1, result.totalPages());
  }

  @Test
  void testGetRecentTweets_WithSearch() {
    // Arrange
    String search = "test search";
    Integer page = 1;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(2);

    when(tweetRepository.findTweetsWithRelationships(
            null, search, TweetSortOption.DATE, "DESC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, search, "DATE", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.tweets().size());
    verify(tweetRepository)
        .findTweetsWithRelationships(null, search, TweetSortOption.DATE, "DESC", null, null);
  }

  @Test
  void testGetRecentTweets_WithHashtags() {
    // Arrange
    List<String> hashtags = List.of("java", "spring");
    Integer page = 1;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(5);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", hashtags, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", hashtags, null);

    // Assert
    assertNotNull(result);
    assertEquals(5, result.tweets().size());
    verify(tweetRepository)
        .findTweetsWithRelationships(null, null, TweetSortOption.DATE, "DESC", hashtags, null);
  }

  @Test
  void testGetRecentTweets_WithHighEngagement() {
    // Arrange
    Boolean highEngagement = true;
    Integer page = 1;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(3);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", null, highEngagement))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(
            null, page, limit, null, "DATE", "DESC", null, highEngagement);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.tweets().size());
    verify(tweetRepository)
        .findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", null, highEngagement);
  }

  @Test
  void testGetRecentTweets_SortByLikes() {
    // Arrange
    Integer page = 1;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(8);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.LIKES, "DESC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "LIKES", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(8, result.tweets().size());
    verify(tweetRepository)
        .findTweetsWithRelationships(null, null, TweetSortOption.LIKES, "DESC", null, null);
  }

  @Test
  void testGetRecentTweets_SecondPage() {
    // Arrange
    Integer page = 2;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(25);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(10, result.tweets().size());
    assertEquals(25, result.total());
    assertEquals(2, result.page());
    assertEquals(3, result.totalPages());
  }

  @Test
  void testGetRecentTweets_LastPagePartial() {
    // Arrange
    Integer page = 3;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(25);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(5, result.tweets().size());
    assertEquals(25, result.total());
    assertEquals(3, result.page());
    assertEquals(3, result.totalPages());
  }

  @Test
  void testGetRecentTweets_EmptyResults() {
    // Arrange
    Integer page = 1;
    Integer limit = 10;

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "DESC", null, null))
        .thenReturn(Collections.emptyList());

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "DESC", null, null);

    // Assert
    assertNotNull(result);
    assertTrue(result.tweets().isEmpty());
    assertEquals(0, result.total());
    assertEquals(1, result.page());
    assertEquals(0, result.totalPages());
  }

  @Test
  void testGetRecentTweets_AscendingOrder() {
    // Arrange
    Integer page = 1;
    Integer limit = 10;
    List<TweetWithStats> tweets = createTweetList(5);

    when(tweetRepository.findTweetsWithRelationships(
            null, null, TweetSortOption.DATE, "ASC", null, null))
        .thenReturn(tweets);

    // Act
    PaginatedTweetsDto result =
        tweetService.getRecentTweets(null, page, limit, null, "DATE", "asc", null, null);

    // Assert
    assertNotNull(result);
    assertEquals(5, result.tweets().size());
    verify(tweetRepository)
        .findTweetsWithRelationships(null, null, TweetSortOption.DATE, "ASC", null, null);
  }

  @Test
  void testGetTweetDetails_Success() {
    // Arrange
    String tweetId = "tweet123";
    TweetDetailsDto tweetDetails =
        new TweetDetailsDto(
            tweetId,
            "url",
            "author",
            "content",
            List.of(),
            List.of(),
            100L,
            50L,
            25L,
            0.5,
            false,
            "en",
            "tweet",
            List.of("java"),
            List.of("user1"),
            null,
            null);

    when(tweetRepository.findTweetDetailsById(tweetId)).thenReturn(Optional.of(tweetDetails));

    // Act
    TweetDetailsDto result = tweetService.getTweetDetails(tweetId);

    // Assert
    assertNotNull(result);
    assertEquals(tweetId, result.id());
    assertEquals("author", result.authorName());
    assertEquals("content", result.content());
    verify(tweetRepository).findTweetDetailsById(tweetId);
  }

  @Test
  void testGetTweetDetails_NotFound() {
    // Arrange
    String tweetId = "nonExistentTweet";
    when(tweetRepository.findTweetDetailsById(tweetId)).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(EntityNotFoundException.class, () -> tweetService.getTweetDetails(tweetId));
    verify(tweetRepository).findTweetDetailsById(tweetId);
  }

  private List<TweetWithStats> createTweetList(int count) {
    List<TweetWithStats> tweets = new ArrayList<>();
    for (int i = 0; i < count; i++) {
      tweets.add(
          new TweetWithStats(
              "tweet" + i,
              "author" + i,
              LocalDateTime.now(),
              "tweet",
              "en",
              "preview" + i,
              "content" + i,
              "twitter" + i,
              "url" + i,
              "conv" + i,
              List.of(),
              List.of(),
              10L,
              5L,
              20L,
              List.of("java"),
              0.5,
              false));
    }
    return tweets;
  }
}

