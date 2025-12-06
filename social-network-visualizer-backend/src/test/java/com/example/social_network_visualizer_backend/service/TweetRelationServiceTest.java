package com.example.social_network_visualizer_backend.service;

import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.ReplyDto;
import com.example.social_network_visualizer_backend.dto.author.AuthorDto;
import com.example.social_network_visualizer_backend.dto.author.MentionDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetDto;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TweetRelationServiceTest {

  @Mock private TweetRepository tweetRepository;

  @Mock private AuthorRepository authorRepository;

  @InjectMocks private TweetRelationService tweetRelationService;

  @Test
  void testCreateTweetHashtagRelations_Success() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    TweetDto tweet1 = createTweetWithHashtags("tweet1", "author1", List.of("java", "spring"));
    TweetDto tweet2 = createTweetWithHashtags("tweet2", "author2", List.of("kotlin"));

    tweetsMap.put("tweet1", tweet1);
    tweetsMap.put("tweet2", tweet2);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetHashtagRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetHashtagRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 3;
  }

  @Test
  void testCreateTweetHashtagRelations_EmptyMap() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    tweetRelationService.createTweetHashtagRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetHashtagRelations(anyList());
  }

  @Test
  void testCreateTweetHashtagRelations_NullHashtags() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();
    TweetDto tweet = createTweetWithHashtags("tweet1", "author1", null);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetHashtagRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetHashtagRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.isEmpty();
  }

  @Test
  void testCreateTweetHashtagRelations_EmptyHashtagsList() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();
    TweetDto tweet = createTweetWithHashtags("tweet1", "author1", Collections.emptyList());
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetHashtagRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetHashtagRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.isEmpty();
  }

  @Test
  void testCreateTweetParentRelations_Success() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    TweetDto parent = createBasicTweet("parent1", "author1");
    TweetDto child1 = createTweetWithParent("child1", "author2", parent);
    TweetDto child2 = createTweetWithParent("child2", "author3", parent);

    tweetsMap.put("parent1", parent);
    tweetsMap.put("child1", child1);
    tweetsMap.put("child2", child2);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetParentRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetParentRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 2;
    boolean hasChild1 = capturedData.stream().anyMatch(m -> "child1".equals(m.get("tweetId")));
    boolean hasChild2 = capturedData.stream().anyMatch(m -> "child2".equals(m.get("tweetId")));
    assert hasChild1 && hasChild2;
  }

  @Test
  void testCreateTweetParentRelations_NoParents() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();
    TweetDto tweet = createBasicTweet("tweet1", "author1");
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetParentRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetParentRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.isEmpty();
  }

  @Test
  void testCreateTweetRepliesRelations_Success() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    List<ReplyDto> replies = new ArrayList<>();
    ReplyDto reply1 = new ReplyDto();
    reply1.setUsername("user1");
    reply1.setUserId("id1");
    replies.add(reply1);

    TweetDto tweet = createTweetWithReplies("tweet1", "author1", replies);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetRepliesRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetRepliesRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 1;
    assert capturedData.get(0).get("tweetId").equals("tweet1");
    assert capturedData.get(0).get("userName").equals("user1");
  }

  @Test
  void testCreateTweetRepliesRelations_NullReplies() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();
    TweetDto tweet = createTweetWithReplies("tweet1", "author1", null);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetRepliesRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetRepliesRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.isEmpty();
  }

  @Test
  void testCreateTweetRepliesRelations_MultipleReplies() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    List<ReplyDto> replies = new ArrayList<>();
    for (int i = 1; i <= 3; i++) {
      ReplyDto reply = new ReplyDto();
      reply.setUsername("user" + i);
      reply.setUserId("id" + i);
      replies.add(reply);
    }

    TweetDto tweet = createTweetWithReplies("tweet1", "author1", replies);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetRepliesRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetRepliesRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 3;
  }

  @Test
  void testCreateTweetMentionsRelations_Success() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    List<MentionDto> mentions = new ArrayList<>();
    MentionDto mention1 = new MentionDto();
    mention1.setUsername("mentionedUser");
    mention1.setUserId("mentionId");
    mentions.add(mention1);

    TweetDto tweet = createTweetWithMentions("tweet1", "author1", mentions);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetMentionsRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetMentionsRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 1;
    assert capturedData.get(0).get("tweetId").equals("tweet1");
    assert capturedData.get(0).get("userName").equals("mentionedUser");
  }

  @Test
  void testCreateTweetMentionsRelations_NullMentions() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();
    TweetDto tweet = createTweetWithMentions("tweet1", "author1", null);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetMentionsRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetMentionsRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.isEmpty();
  }

  @Test
  void testCreateTweetMentionsRelations_MultipleMentions() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    List<MentionDto> mentions = new ArrayList<>();
    for (int i = 1; i <= 5; i++) {
      MentionDto mention = new MentionDto();
      mention.setUsername("user" + i);
      mention.setUserId("id" + i);
      mentions.add(mention);
    }

    TweetDto tweet = createTweetWithMentions("tweet1", "author1", mentions);
    tweetsMap.put("tweet1", tweet);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetMentionsRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetMentionsRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 5;
  }

  @Test
  void testCreateAuthorTweetRelations_Success() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    TweetDto tweet1 = createBasicTweet("tweet1", "author1");
    TweetDto tweet2 = createBasicTweet("tweet2", "author2");
    TweetDto tweet3 = createBasicTweet("tweet3", "author1");

    tweetsMap.put("tweet1", tweet1);
    tweetsMap.put("tweet2", tweet2);
    tweetsMap.put("tweet3", tweet3);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createAuthorTweetRelations(tweetsMap);

    // Assert
    verify(authorRepository).createAuthorTweetRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 3;
    assert capturedData.get(0).get("userName").equals("author1");
  }

  @Test
  void testCreateAuthorTweetRelations_EmptyMap() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createAuthorTweetRelations(tweetsMap);

    // Assert
    verify(authorRepository).createAuthorTweetRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.isEmpty();
  }

  @Test
  void testCreateTweetHashtagRelations_MultipleTweetsWithHashtags() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    for (int i = 1; i <= 5; i++) {
      TweetDto tweet =
          createTweetWithHashtags("tweet" + i, "author" + i, List.of("tag" + i, "common"));
      tweetsMap.put("tweet" + i, tweet);
    }

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetHashtagRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetHashtagRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 10;
  }

  @Test
  void testCreateTweetParentRelations_ChainedParents() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    TweetDto grandparent = createBasicTweet("gp", "author1");
    TweetDto parent = createTweetWithParent("parent", "author2", grandparent);
    TweetDto child = createTweetWithParent("child", "author3", parent);

    tweetsMap.put("gp", grandparent);
    tweetsMap.put("parent", parent);
    tweetsMap.put("child", child);

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);

    // Act
    tweetRelationService.createTweetParentRelations(tweetsMap);

    // Assert
    verify(tweetRepository).createTweetParentRelations(captor.capture());
    List<Map<String, Object>> capturedData = captor.getValue();
    assert capturedData.size() == 2;
  }

  private TweetDto createBasicTweet(String tweetId, String authorName) {
    TweetDto tweet = new TweetDto();
    tweet.setId(tweetId);

    AuthorDto author = new AuthorDto();
    author.setUserName(authorName);
    tweet.setAuthor(author);

    tweet.setContent("test content");
    tweet.setObjectCreatedAt(new Date());
    tweet.setPublicationDate(new Date());

    return tweet;
  }

  private TweetDto createTweetWithHashtags(String tweetId, String authorName, List<String> hashtags) {
    TweetDto tweet = createBasicTweet(tweetId, authorName);
    tweet.setHashtags(hashtags);
    return tweet;
  }

  private TweetDto createTweetWithParent(String tweetId, String authorName, TweetDto parent) {
    TweetDto tweet = createBasicTweet(tweetId, authorName);
    tweet.setParent(parent);
    return tweet;
  }

  private TweetDto createTweetWithReplies(String tweetId, String authorName, List<ReplyDto> replies) {
    TweetDto tweet = createBasicTweet(tweetId, authorName);
    tweet.setReplies(replies);
    return tweet;
  }

  private TweetDto createTweetWithMentions(
      String tweetId, String authorName, List<MentionDto> mentions) {
    TweetDto tweet = createBasicTweet(tweetId, authorName);
    tweet.setMentions(mentions);
    return tweet;
  }
}

