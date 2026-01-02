package com.example.social_network_visualizer_backend.service.graph;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TweetNodeQueryStrategyTest {

  @Mock private TweetRepository tweetRepository;

  @InjectMocks private TweetNodeQueryStrategy strategy;

  @Test
  void testGetNodeType() {
    // Act
    NodeType result = strategy.getNodeType();

    // Assert
    assertEquals(NodeType.TWEET, result);
  }

  @Test
  void testFetchNodes_InWorkspace() {
    // Arrange
    TweetNodeDto tweet1 = createSampleTweet();
    tweet1.setId("tweet1");
    TweetNodeDto tweet2 = createSampleTweet();
    tweet2.setId("tweet2");
    List<TweetNodeDto> expectedTweets = List.of(tweet1, tweet2);

    when(tweetRepository.findTweets(true, 15)).thenReturn(expectedTweets);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), true, 15);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("tweet1", result.get(0).getId());
    assertEquals("tweet2", result.get(1).getId());
    verify(tweetRepository).findTweets(true, 15);
  }

  @Test
  void testFetchNodes_NotInWorkspace() {
    // Arrange
    TweetNodeDto tweet1 = createSampleTweet();
    tweet1.setId("tweet1");
    List<TweetNodeDto> expectedTweets = List.of(tweet1);

    when(tweetRepository.findTweets(false, 30)).thenReturn(expectedTweets);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), false, 30);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("tweet1", result.get(0).getId());
    verify(tweetRepository).findTweets(false, 30);
  }

  @Test
  void testFetchNodes_WithCommunityId_IgnoresCommunityId() {
    // Arrange
    TweetNodeDto tweet1 = createSampleTweet();
    tweet1.setId("tweet1");
    List<TweetNodeDto> expectedTweets = List.of(tweet1);

    when(tweetRepository.findTweets(false, 10)).thenReturn(expectedTweets);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.of(5), false, 10);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    verify(tweetRepository).findTweets(false, 10);
  }

  @Test
  void testFetchNodes_EmptyResult() {
    // Arrange
    when(tweetRepository.findTweets(false, 10)).thenReturn(List.of());

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), false, 10);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(tweetRepository).findTweets(false, 10);
  }

  public TweetNodeDto createSampleTweet() {
    TweetNodeDto tweet = new TweetNodeDto();

    tweet.setContent("To jest przykładowa treść tweeta");
    tweet.setAuthorName("Jan Kowalski");
    tweet.setLikesCount(123L);
    tweet.setRetweetsCount(45L);
    tweet.setRepliesCount(6L);
    tweet.setLanguage("pl");
    tweet.setObjectCreatedAt(LocalDateTime.now());
    tweet.setPublicationDate(LocalDateTime.now().minusMinutes(1));
    tweet.setUrl("https://twitter.com/jankowalski/status/123456");

    return tweet;
  }
}
