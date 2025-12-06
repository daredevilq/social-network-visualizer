package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.author.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.author.AuthorStatsDto;
import com.example.social_network_visualizer_backend.dto.author.TweetPreviewDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthorServiceTest {

  @Mock private AuthorRepository authorRepository;

  @InjectMocks private AuthorService authorService;

  @Test
  void testFindLast10TweetsByAuthor_Success() {
    // Arrange
    String authorName = "testUser";
    Tweet tweet1 = new Tweet();
    tweet1.setId("1");
    Tweet tweet2 = new Tweet();
    tweet2.setId("2");
    List<Tweet> expectedTweets = Arrays.asList(tweet1, tweet2);
    when(authorRepository.findLast10TweetsByAuthorUsername(authorName)).thenReturn(expectedTweets);

    // Act
    List<Tweet> result = authorService.findLast10TweetsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("1", result.get(0).getId());
    verify(authorRepository).findLast10TweetsByAuthorUsername(authorName);
  }

  @Test
  void testFindLast10TweetsByAuthor_ExceptionReturnsEmptyList() {
    // Arrange
    String authorName = "testUser";
    when(authorRepository.findLast10TweetsByAuthorUsername(authorName))
        .thenThrow(new RuntimeException("Database error"));

    // Act
    List<Tweet> result = authorService.findLast10TweetsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(authorRepository).findLast10TweetsByAuthorUsername(authorName);
  }

  @Test
  void testFindLast3TweetUrlsByAuthor_Success() {
    // Arrange
    String authorName = "testUser";
    TweetPreviewDto preview1 = new TweetPreviewDto("url1", "content1");
    TweetPreviewDto preview2 = new TweetPreviewDto("url2", "content2");
    List<TweetPreviewDto> expectedPreviews = Arrays.asList(preview1, preview2);
    when(authorRepository.findLast3TweetUrlsByAuthorUsername(authorName))
        .thenReturn(expectedPreviews);

    // Act
    List<TweetPreviewDto> result = authorService.findLast3TweetUrlsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("url1", result.get(0).getUrl());
    verify(authorRepository).findLast3TweetUrlsByAuthorUsername(authorName);
  }

  @Test
  void testFindAuthorById_Success() {
    // Arrange
    String authorName = "testUser";
    LocalDateTime firstTweetDate = LocalDateTime.of(2023, 11, 15, 10, 30);
    AuthorStatsDto statsDto =
        new AuthorStatsDto(firstTweetDate, 100L, 20L, 30L, 50L, 5.5, 3.3, 10.7);
    when(authorRepository.findStatsByAuthorId(authorName)).thenReturn(Optional.of(statsDto));

    // Act
    AuthorDataResponse result = authorService.findAuthorById(authorName);

    // Assert
    assertNotNull(result);
    assertEquals("testUser", result.userName());
    assertEquals("2023-11-15", result.dateOfFirstTweet());
    assertEquals(100L, result.tweetsCount());
    assertEquals(20L, result.quotesCount());
    assertEquals(30L, result.retweetsCount());
    assertEquals(50L, result.repliesCount());
    assertEquals(5.5, result.averageRepliesCount());
    assertEquals(3.3, result.averageRetweetsCount());
    assertEquals(10.7, result.averageLikesCount());
    verify(authorRepository).findStatsByAuthorId(authorName);
  }

  @Test
  void testFindAuthorById_RoundsAverages() {
    // Arrange
    String authorName = "testUser";
    LocalDateTime firstTweetDate = LocalDateTime.of(2023, 11, 15, 10, 30);
    AuthorStatsDto statsDto =
        new AuthorStatsDto(firstTweetDate, 100L, 20L, 30L, 50L, 5.556, 3.334, 10.789);
    when(authorRepository.findStatsByAuthorId(authorName)).thenReturn(Optional.of(statsDto));

    // Act
    AuthorDataResponse result = authorService.findAuthorById(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(5.56, result.averageRepliesCount());
    assertEquals(3.33, result.averageRetweetsCount());
    assertEquals(10.79, result.averageLikesCount());
    verify(authorRepository).findStatsByAuthorId(authorName);
  }

  @Test
  void testFindAuthorById_NullDateReturnsNoData() {
    // Arrange
    String authorName = "testUser";
    AuthorStatsDto statsDto = new AuthorStatsDto(null, 100L, 20L, 30L, 50L, 5.5, 3.3, 10.7);
    when(authorRepository.findStatsByAuthorId(authorName)).thenReturn(Optional.of(statsDto));

    // Act
    AuthorDataResponse result = authorService.findAuthorById(authorName);

    // Assert
    assertNotNull(result);
    assertEquals("No data", result.dateOfFirstTweet());
    verify(authorRepository).findStatsByAuthorId(authorName);
  }

  @Test
  void testFindAuthorById_AuthorNotFound() {
    // Arrange
    String authorName = "nonexistent";
    when(authorRepository.findStatsByAuthorId(authorName)).thenReturn(Optional.empty());

    // Act & Assert
    EntityNotFoundException exception =
        assertThrows(EntityNotFoundException.class, () -> authorService.findAuthorById(authorName));
    assertTrue(exception.getMessage().contains("Author nonexistent not found"));
    verify(authorRepository).findStatsByAuthorId(authorName);
  }

  @Test
  void testGetAuthorActivity_GroupsByYearAndMonth() {
    // Arrange
    String authorName = "testUser";
    ZonedDateTime date1 = ZonedDateTime.of(2023, 11, 15, 10, 0, 0, 0, ZoneId.of("UTC"));
    ZonedDateTime date2 = ZonedDateTime.of(2023, 11, 20, 12, 0, 0, 0, ZoneId.of("UTC"));
    ZonedDateTime date3 = ZonedDateTime.of(2023, 12, 5, 14, 0, 0, 0, ZoneId.of("UTC"));
    List<ZonedDateTime> activities = Arrays.asList(date1, date2, date3);
    when(authorRepository.getAuthorActivity(authorName)).thenReturn(activities);

    // Act
    Map<String, Long> result = authorService.getAuthorActivity(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(2L, result.get("2023-11"));
    assertEquals(1L, result.get("2023-12"));
    verify(authorRepository).getAuthorActivity(authorName);
  }

  @Test
  void testGetAuthorActivity_EmptyList() {
    // Arrange
    String authorName = "testUser";
    when(authorRepository.getAuthorActivity(authorName)).thenReturn(Collections.emptyList());

    // Act
    Map<String, Long> result = authorService.getAuthorActivity(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(authorRepository).getAuthorActivity(authorName);
  }

  @Test
  void testGetAuthorActivity_SingleMonthFormatsCorrectly() {
    // Arrange
    String authorName = "testUser";
    ZonedDateTime date = ZonedDateTime.of(2023, 1, 15, 10, 0, 0, 0, ZoneId.of("UTC"));
    when(authorRepository.getAuthorActivity(authorName)).thenReturn(Arrays.asList(date));

    // Act
    Map<String, Long> result = authorService.getAuthorActivity(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertTrue(result.containsKey("2023-01"));
    assertEquals(1L, result.get("2023-01"));
  }

  @Test
  void testFindTopHashtagsByAuthor_Success() {
    // Arrange
    String authorName = "testUser";
    HashtagFrequency hashtag1 = new HashtagFrequency("java", 10);
    HashtagFrequency hashtag2 = new HashtagFrequency("spring", 8);
    List<HashtagFrequency> expectedHashtags = Arrays.asList(hashtag1, hashtag2);
    when(authorRepository.findTopHashtagsByAuthor(authorName)).thenReturn(expectedHashtags);

    // Act
    List<HashtagFrequency> result = authorService.findTopHashtagsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("java", result.get(0).name());
    verify(authorRepository).findTopHashtagsByAuthor(authorName);
  }

  @Test
  void testFindMentionsAuthorsByAuthor_Success() {
    // Arrange
    String authorName = "testUser";
    List<String> expectedMentions = Arrays.asList("user1", "user2", "user3");
    when(authorRepository.findMentionsAuthorsByAuthor(authorName)).thenReturn(expectedMentions);

    // Act
    List<String> result = authorService.findMentionsAuthorsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    verify(authorRepository).findMentionsAuthorsByAuthor(authorName);
  }

  @Test
  void testFindAuthorRetweets_Success() {
    // Arrange
    String authorName = "testUser";
    List<String> expectedRetweets = Arrays.asList("tweet1", "tweet2");
    when(authorRepository.findAuthorRetweets(authorName)).thenReturn(expectedRetweets);

    // Act
    List<String> result = authorService.findAuthorRetweets(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    verify(authorRepository).findAuthorRetweets(authorName);
  }

  @Test
  void testFindRetweetsByAuthor_Success() {
    // Arrange
    String authorName = "testUser";
    List<String> expectedRetweets = Arrays.asList("retweet1", "retweet2");
    when(authorRepository.findRetweetsByAuthor(authorName)).thenReturn(expectedRetweets);

    // Act
    List<String> result = authorService.findRetweetsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    verify(authorRepository).findRetweetsByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_FiltersStopWords() {
    // Arrange
    String authorName = "testUser";
    List<String> tweetContents =
        Arrays.asList(
            "Java is the best programming language",
            "I love Java and Spring Framework",
            "Java developers are awesome");
    when(authorRepository.findTweetsContentByAuthor(authorName)).thenReturn(tweetContents);

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("java"));
    assertFalse(result.containsKey("the"));
    assertFalse(result.containsKey("is"));
    assertFalse(result.containsKey("and"));
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_LimitsTo30Words() {
    // Arrange
    String authorName = "testUser";
    String longTweet =
        "unique1 unique2 unique3 unique4 unique5 unique6 unique7 unique8 unique9 unique10 unique11 unique12";
    when(authorRepository.findTweetsContentByAuthor(authorName))
        .thenReturn(Arrays.asList(longTweet));

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.size() <= 30);
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_FiltersShortWords() {
    // Arrange
    String authorName = "testUser";
    List<String> tweetContents = Arrays.asList("a ab abc abcd abcde");
    when(authorRepository.findTweetsContentByAuthor(authorName)).thenReturn(tweetContents);

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("abc"));
    assertTrue(result.containsKey("abcd"));
    assertTrue(result.containsKey("abcde"));
    assertFalse(result.containsKey("a"));
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_HandlesCaseInsensitive() {
    // Arrange
    String authorName = "testUser";
    List<String> tweetContents = Arrays.asList("Java JAVA java JaVa");
    when(authorRepository.findTweetsContentByAuthor(authorName)).thenReturn(tweetContents);

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertTrue(result.containsKey("java"));
    assertEquals(4L, result.get("java"));
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_EmptyTweetContent() {
    // Arrange
    String authorName = "testUser";
    when(authorRepository.findTweetsContentByAuthor(authorName))
        .thenReturn(Collections.emptyList());

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_NullTweetContent() {
    // Arrange
    String authorName = "testUser";
    when(authorRepository.findTweetsContentByAuthor(authorName)).thenReturn(null);

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_FiltersPunctuation() {
    // Arrange
    String authorName = "testUser";
    List<String> tweetContents = Arrays.asList("Hello, world! Testing... #hashtag @mention");
    when(authorRepository.findTweetsContentByAuthor(authorName)).thenReturn(tweetContents);

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("hello"));
    assertTrue(result.containsKey("world"));
    assertTrue(result.containsKey("testing"));
    assertTrue(result.containsKey("hashtag"));
    assertTrue(result.containsKey("mention"));
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindMostCommonWords_CountsFrequency() {
    // Arrange
    String authorName = "testUser";
    List<String> tweetContents =
        Arrays.asList(
            "java java java spring spring framework",
            "java programming spring framework development");
    when(authorRepository.findTweetsContentByAuthor(authorName)).thenReturn(tweetContents);

    // Act
    Map<String, Long> result = authorService.findMostCommonWords(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("java"));
    assertTrue(result.containsKey("spring"));
    assertTrue(result.get("java") > result.get("spring"));
    verify(authorRepository).findTweetsContentByAuthor(authorName);
  }

  @Test
  void testFindTheMostViralTweet_Success() {
    // Arrange
    String authorName = "testUser";
    ViralTweetDto viralTweet =
        new ViralTweetDto("testUser", "123", "preview", "url", 1000, 500, 200, 1700);
    List<ViralTweetDto> expectedTweets = Arrays.asList(viralTweet);
    when(authorRepository.findTheMostViralTweet(authorName)).thenReturn(expectedTweets);

    // Act
    List<ViralTweetDto> result = authorService.findTheMostViralTweet(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("123", result.get(0).tweetId());
    assertEquals(1700, result.get(0).engagementScore());
    verify(authorRepository).findTheMostViralTweet(authorName);
  }

  @Test
  void testGetAuthorActivityHeatmap_Success() {
    // Arrange
    String authorName = "testUser";
    ActivityHeatmap heatmap1 = new ActivityHeatmap(10, 1, 100);
    ActivityHeatmap heatmap2 = new ActivityHeatmap(15, 2, 150);
    List<ActivityHeatmap> expectedHeatmap = Arrays.asList(heatmap1, heatmap2);
    when(authorRepository.getAuthorActivityHeatMap(authorName)).thenReturn(expectedHeatmap);

    // Act
    List<ActivityHeatmap> result = authorService.getAuthorActivityHeatmap(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(10, result.get(0).hour());
    assertEquals(1, result.get(0).dayOfWeek());
    verify(authorRepository).getAuthorActivityHeatMap(authorName);
  }

  @Test
  void testFindLast10TweetsByAuthor_EmptyResult() {
    // Arrange
    String authorName = "testUser";
    when(authorRepository.findLast10TweetsByAuthorUsername(authorName))
        .thenReturn(Collections.emptyList());

    // Act
    List<Tweet> result = authorService.findLast10TweetsByAuthor(authorName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(authorRepository).findLast10TweetsByAuthorUsername(authorName);
  }

  @Test
  void testFindAuthorById_ZeroCounts() {
    // Arrange
    String authorName = "testUser";
    LocalDateTime firstTweetDate = LocalDateTime.of(2023, 11, 15, 10, 30);
    AuthorStatsDto statsDto = new AuthorStatsDto(firstTweetDate, 0L, 0L, 0L, 0L, 0.0, 0.0, 0.0);
    when(authorRepository.findStatsByAuthorId(authorName)).thenReturn(Optional.of(statsDto));

    // Act
    AuthorDataResponse result = authorService.findAuthorById(authorName);

    // Assert
    assertNotNull(result);
    assertEquals(0L, result.tweetsCount());
    assertEquals(0.0, result.averageRepliesCount());
    assertEquals(0.0, result.averageRetweetsCount());
    assertEquals(0.0, result.averageLikesCount());
    verify(authorRepository).findStatsByAuthorId(authorName);
  }
}
