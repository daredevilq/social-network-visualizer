package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagProfileDto;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class HashtagServiceTest {

  @Mock private HashtagRepository hashtagRepository;

  @InjectMocks private HashtagService hashtagService;

  @Test
  void testGetHashtagDetails_Success() {
    // Arrange
    String hashtagName = "Java";
    int authorLimit = 5;
    int tweetLimit = 3;
    List<TopAuthorsDto> topAuthors = new ArrayList<>();
    topAuthors.add(new TopAuthorsDto("user1", 50));
    topAuthors.add(new TopAuthorsDto("user2", 30));

    List<ViralTweetDto> topTweets = new ArrayList<>();
    topTweets.add(new ViralTweetDto("author1", "tweet1", "Content 1", "url1", 10, 5, 2, 100));
    topTweets.add(new ViralTweetDto("author2", "tweet2", "Content 2", "url2", 8, 3, 1, 75));

    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(topAuthors);
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit)).thenReturn(topTweets);

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.hashtag());
    assertEquals(2, result.topAuthors().size());
    assertEquals(2, result.topTweets().size());
    assertEquals("user1", result.topAuthors().get(0).username());
    assertEquals(50, result.topAuthors().get(0).count());
    assertEquals("tweet1", result.topTweets().get(0).tweetId());
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_EmptyResults() {
    // Arrange
    String hashtagName = "UnpopularTag";
    int authorLimit = 10;
    int tweetLimit = 10;
    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(Collections.emptyList());
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit))
        .thenReturn(Collections.emptyList());

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.hashtag());
    assertTrue(result.topAuthors().isEmpty());
    assertTrue(result.topTweets().isEmpty());
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_WithSpecialCharacters() {
    // Arrange
    String hashtagName = "Spring#Boot";
    int authorLimit = 5;
    int tweetLimit = 3;
    List<TopAuthorsDto> topAuthors = List.of(new TopAuthorsDto("developer", 10));
    List<ViralTweetDto> topTweets =
        List.of(new ViralTweetDto("author", "id1", "text", "url", 1, 0, 0, 5));

    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(topAuthors);
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit)).thenReturn(topTweets);

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.hashtag());
    assertEquals(1, result.topAuthors().size());
    assertEquals(1, result.topTweets().size());
  }

  @Test
  void testGetHashtagDetails_OnlyTopUsers() {
    // Arrange
    String hashtagName = "Python";
    int authorLimit = 5;
    int tweetLimit = 3;
    List<TopAuthorsDto> topAuthors =
        List.of(new TopAuthorsDto("pythonDev", 100), new TopAuthorsDto("coder123", 50));

    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(topAuthors);
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit))
        .thenReturn(Collections.emptyList());

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.hashtag());
    assertEquals(2, result.topAuthors().size());
    assertTrue(result.topTweets().isEmpty());
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_OnlyTopTweets() {
    // Arrange
    String hashtagName = "JavaScript";
    int authorLimit = 5;
    int tweetLimit = 3;
    List<ViralTweetDto> topTweets =
        List.of(
            new ViralTweetDto("jsdev", "tw1", "JS is awesome", "url1", 50, 20, 10, 200),
            new ViralTweetDto("reactdev", "tw2", "React tutorial", "url2", 40, 15, 8, 150));

    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(Collections.emptyList());
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit)).thenReturn(topTweets);

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.hashtag());
    assertTrue(result.topAuthors().isEmpty());
    assertEquals(2, result.topTweets().size());
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_WithNullHashtagName() {
    // Arrange
    String hashtagName = null;
    int authorLimit = 5;
    int tweetLimit = 3;
    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(Collections.emptyList());
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit))
        .thenReturn(Collections.emptyList());

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertNull(result.hashtag());
    verify(hashtagRepository).findTopAuthorsByHashtag(null, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(null, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_WithEmptyHashtagName() {
    // Arrange
    String hashtagName = "";
    int authorLimit = 5;
    int tweetLimit = 3;
    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(Collections.emptyList());
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit))
        .thenReturn(Collections.emptyList());

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals("", result.hashtag());
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_LargeNumberOfResults() {
    // Arrange
    String hashtagName = "Trending";
    int authorLimit = 100;
    int tweetLimit = 100;
    List<TopAuthorsDto> topAuthors = new ArrayList<>();
    for (int i = 0; i < 100; i++) {
      topAuthors.add(new TopAuthorsDto("user" + i, 100 - i));
    }

    List<ViralTweetDto> topTweets = new ArrayList<>();
    for (int i = 0; i < 100; i++) {
      topTweets.add(
          new ViralTweetDto(
              "author" + i,
              "tweet" + i,
              "Content " + i,
              "url" + i,
              100 - i,
              50 - (i / 2),
              20 - (i / 5),
              1000 - i * 10));
    }

    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(topAuthors);
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit)).thenReturn(topTweets);

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.hashtag());
    assertEquals(100, result.topAuthors().size());
    assertEquals(100, result.topTweets().size());
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testGetHashtagDetails_RepositoryThrowsException() {
    // Arrange
    String hashtagName = "ErrorTag";
    int authorLimit = 5;
    int tweetLimit = 3;
    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenThrow(new RuntimeException("Database error"));

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit));
    verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    verify(hashtagRepository, never()).findTopTweetsByHashtag(anyString(), anyInt());
  }

  @Test
  void testGetHashtagDetails_WithLowercaseHashtag() {
    // Arrange
    String hashtagName = "java";
    int authorLimit = 5;
    int tweetLimit = 3;
    List<TopAuthorsDto> topAuthors = List.of(new TopAuthorsDto("javaDev", 25));
    List<ViralTweetDto> topTweets =
        List.of(new ViralTweetDto("student", "t1", "Learning Java", "url", 3, 1, 0, 10));

    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(topAuthors);
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit)).thenReturn(topTweets);

    // Act
    HashtagDetailsDto result =
        hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    assertNotNull(result);
    assertEquals("java", result.hashtag());
    assertEquals(1, result.topAuthors().size());
    assertEquals(1, result.topTweets().size());
  }

  @Test
  void testGetHashtagDetails_VerifyCallOrder() {
    // Arrange
    String hashtagName = "OrderTest";
    int authorLimit = 5;
    int tweetLimit = 3;
    when(hashtagRepository.findTopAuthorsByHashtag(hashtagName, authorLimit))
        .thenReturn(Collections.emptyList());
    when(hashtagRepository.findTopTweetsByHashtag(hashtagName, tweetLimit))
        .thenReturn(Collections.emptyList());

    // Act
    hashtagService.getHashtagDetails(hashtagName, authorLimit, tweetLimit);

    // Assert
    var inOrder = inOrder(hashtagRepository);
    inOrder.verify(hashtagRepository).findTopAuthorsByHashtag(hashtagName, authorLimit);
    inOrder.verify(hashtagRepository).findTopTweetsByHashtag(hashtagName, tweetLimit);
  }

  @Test
  void testFindMostCommonWords_FiltersStopWords() {
    // Arrange
    String hashtagName = "java";
    List<String> tweetsContent =
        List.of("Java is the best programming language", "I love Java and Spring");
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(tweetsContent);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("java"));
    assertFalse(result.containsKey("the"));
    assertFalse(result.containsKey("is"));
    assertFalse(result.containsKey("and"));
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_LimitsTo30Words() {
    // Arrange
    String hashtagName = "trending";
    StringBuilder largeContent = new StringBuilder();
    for (int i = 0; i < 100; i++) {
      largeContent.append("word").append(i).append(" ");
    }
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName))
        .thenReturn(List.of(largeContent.toString()));

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.size() <= 30);
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_FiltersShortWords() {
    // Arrange
    String hashtagName = "test";
    List<String> tweetsContent = List.of("a ab abc abcd abcde");
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(tweetsContent);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("abc"));
    assertTrue(result.containsKey("abcd"));
    assertTrue(result.containsKey("abcde"));
    assertFalse(result.containsKey("a"));
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_CountsFrequency() {
    // Arrange
    String hashtagName = "programming";
    List<String> tweetsContent = List.of("java java java java python");
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(tweetsContent);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertTrue(result.containsKey("java"));
    assertEquals(4L, result.get("java"));
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_EmptyTweetsList() {
    // Arrange
    String hashtagName = "empty";
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName))
        .thenReturn(Collections.emptyList());

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_NullTweetsList() {
    // Arrange
    String hashtagName = "null";
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(null);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_HandlesSpecialCharacters() {
    // Arrange
    String hashtagName = "special";
    List<String> tweetsContent = List.of("Hello @world! #testing mentions @user and #hashtag");
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(tweetsContent);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("hello"));
    assertTrue(result.containsKey("world"));
    assertTrue(result.containsKey("testing"));
    assertTrue(result.containsKey("hashtag"));
    assertTrue(result.containsKey("mentions"));
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_SortsByFrequency() {
    // Arrange
    String hashtagName = "sorting";
    List<String> tweetsContent = List.of("java java java spring spring python");
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(tweetsContent);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("java"));
    assertTrue(result.containsKey("spring"));
    assertTrue(result.get("java") > result.get("spring"));
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testFindMostCommonWords_CaseInsensitive() {
    // Arrange
    String hashtagName = "case";
    List<String> tweetsContent = List.of("Java JAVA java JaVa");
    when(hashtagRepository.findTweetsContentByHashtag(hashtagName)).thenReturn(tweetsContent);

    // Act
    Map<String, Long> result = hashtagService.findMostCommonWords(hashtagName);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertTrue(result.containsKey("java"));
    assertEquals(4L, result.get("java"));
    verify(hashtagRepository).findTweetsContentByHashtag(hashtagName);
  }

  @Test
  void testGetHashtagProfile_Success() {
    // Arrange
    String hashtagName = "java";
    HashtagProfileDto expectedProfile =
        HashtagProfileDto.builder()
            .name(hashtagName)
            .totalUsage(100L)
            .uniqueUsers(50L)
            .totalLikes(200L)
            .totalRetweets(25L)
            .totalReplies(30L)
            .distinctLanguages(5L)
            .build();
    when(hashtagRepository.findHashtagProfile(hashtagName)).thenReturn(expectedProfile);

    // Act
    HashtagProfileDto result = hashtagService.getHashtagProfile(hashtagName);

    // Assert
    assertNotNull(result);
    assertEquals(hashtagName, result.getName());
    assertEquals(100L, result.getTotalUsage());
    assertEquals(50L, result.getUniqueUsers());
    assertEquals(25L, result.getTotalRetweets());
    verify(hashtagRepository).findHashtagProfile(hashtagName);
  }

  @Test
  void testGetHashtagProfile_HashtagNotFound() {
    // Arrange
    String hashtagName = "nonexistent";
    when(hashtagRepository.findHashtagProfile(hashtagName)).thenReturn(null);

    // Act
    HashtagProfileDto result = hashtagService.getHashtagProfile(hashtagName);

    // Assert
    assertNull(result);
    verify(hashtagRepository).findHashtagProfile(hashtagName);
  }

  @Test
  void testGetHashtagActivity_Success() {
    // Arrange
    String hashtagName = "java";
    List<ZonedDateTime> activityDates =
        List.of(
            ZonedDateTime.parse("2024-01-15T10:00:00Z"),
            ZonedDateTime.parse("2024-01-20T14:30:00Z"),
            ZonedDateTime.parse("2024-01-25T09:15:00Z"),
            ZonedDateTime.parse("2024-02-10T16:45:00Z"),
            ZonedDateTime.parse("2024-02-15T11:20:00Z"));
    when(hashtagRepository.getHashtagActivity(hashtagName)).thenReturn(activityDates);

    // Act
    Map<String, Long> result = hashtagService.getHashtagActivity(hashtagName);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertTrue(result.containsKey("2024-01"));
    assertTrue(result.containsKey("2024-02"));
    assertEquals(3L, result.get("2024-01"));
    assertEquals(2L, result.get("2024-02"));
    verify(hashtagRepository).getHashtagActivity(hashtagName);
  }

  @Test
  void testGetHashtagActivity_EmptyActivity() {
    // Arrange
    String hashtagName = "inactive";
    when(hashtagRepository.getHashtagActivity(hashtagName)).thenReturn(Collections.emptyList());

    // Act
    Map<String, Long> result = hashtagService.getHashtagActivity(hashtagName);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(hashtagRepository).getHashtagActivity(hashtagName);
  }

  @Test
  void testGetHashtagActivity_SingleMonth() {
    // Arrange
    String hashtagName = "trending";
    List<ZonedDateTime> activityDates =
        List.of(
            ZonedDateTime.parse("2024-03-01T10:00:00Z"),
            ZonedDateTime.parse("2024-03-15T14:30:00Z"),
            ZonedDateTime.parse("2024-03-30T09:15:00Z"));
    when(hashtagRepository.getHashtagActivity(hashtagName)).thenReturn(activityDates);

    // Act
    Map<String, Long> result = hashtagService.getHashtagActivity(hashtagName);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertTrue(result.containsKey("2024-03"));
    assertEquals(3L, result.get("2024-03"));
    verify(hashtagRepository).getHashtagActivity(hashtagName);
  }

  @Test
  void testGetHashtagActivity_SortedByDate() {
    // Arrange
    String hashtagName = "sorted";
    List<ZonedDateTime> activityDates =
        List.of(
            ZonedDateTime.parse("2024-12-01T10:00:00Z"),
            ZonedDateTime.parse("2024-01-15T14:30:00Z"),
            ZonedDateTime.parse("2024-06-20T09:15:00Z"));
    when(hashtagRepository.getHashtagActivity(hashtagName)).thenReturn(activityDates);

    // Act
    Map<String, Long> result = hashtagService.getHashtagActivity(hashtagName);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    // TreeMap should sort keys
    var keys = result.keySet().stream().toList();
    assertEquals("2024-01", keys.get(0));
    assertEquals("2024-06", keys.get(1));
    assertEquals("2024-12", keys.get(2));
    verify(hashtagRepository).getHashtagActivity(hashtagName);
  }
}
