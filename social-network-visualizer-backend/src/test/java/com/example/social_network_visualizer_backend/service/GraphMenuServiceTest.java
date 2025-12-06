package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.repository.CommunityRepository;
import com.example.social_network_visualizer_backend.repository.GraphMenuRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class GraphMenuServiceTest {

  @Mock private GraphMenuRepository graphMenuRepository;

  @Mock private WorkspaceService workspaceService;

  @Mock private CommunityRepository communityRepository;

  @InjectMocks private GraphMenuService graphMenuService;

  @Test
  void testAddAuthorsLatestTweets_Success() {
    // Arrange
    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setName("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setName("author2");
    List<AuthorNodeDto> authors = Arrays.asList(author1, author2);

    TweetNodeDto tweet1 = new TweetNodeDto();
    tweet1.setId("tweet1");
    TweetNodeDto tweet2 = new TweetNodeDto();
    tweet2.setId("tweet2");

    when(graphMenuRepository.findAuthorLatestTweets("author1", 5))
        .thenReturn(Arrays.asList(tweet1));
    when(graphMenuRepository.findAuthorLatestTweets("author2", 5))
        .thenReturn(Arrays.asList(tweet2));

    // Act
    graphMenuService.addAuthorsLatestTweets(authors, 5);

    // Assert
    verify(graphMenuRepository).findAuthorLatestTweets("author1", 5);
    verify(graphMenuRepository).findAuthorLatestTweets("author2", 5);
    verify(workspaceService, times(2)).updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddAuthorsLatestTweets_EmptyTweetList() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    when(graphMenuRepository.findAuthorLatestTweets("author1", 10))
        .thenReturn(Collections.emptyList());

    // Act
    graphMenuService.addAuthorsLatestTweets(authors, 10);

    // Assert
    verify(graphMenuRepository).findAuthorLatestTweets("author1", 10);
    verify(workspaceService, never()).updateWorkspaceMembership(any(NodeDto.class), anyBoolean());
  }

  @Test
  void testAddAuthorsMostPopularTweets_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    TweetNodeDto tweet1 = new TweetNodeDto();
    tweet1.setId("popular1");
    TweetNodeDto tweet2 = new TweetNodeDto();
    tweet2.setId("popular2");

    when(graphMenuRepository.findAuthorMostPopularTweets("author1", 3))
        .thenReturn(Arrays.asList(tweet1, tweet2));

    // Act
    graphMenuService.addAuthorsMostPopularTweets(authors, 3);

    // Assert
    verify(graphMenuRepository).findAuthorMostPopularTweets("author1", 3);
    verify(workspaceService, times(2)).updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddAuthorsCommunities_WithNodeNumber() {
    // Arrange
    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setName("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setName("author2");
    List<AuthorNodeDto> authors = Arrays.asList(author1, author2);

    Author communityAuthor1 = new Author();
    communityAuthor1.setUserName("commAuthor1");
    Author communityAuthor2 = new Author();
    communityAuthor2.setUserName("commAuthor2");

    when(communityRepository.findCommunityIdByAuthorId("author1")).thenReturn(Optional.of(1));
    when(communityRepository.findCommunityIdByAuthorId("author2")).thenReturn(Optional.of(1));
    when(communityRepository.findAuthorsByCommunityWithLimit(1, 10))
        .thenReturn(Arrays.asList(communityAuthor1, communityAuthor2));

    // Act
    graphMenuService.addAuthorsCommunities(authors, Optional.of(10));

    // Assert
    verify(communityRepository).findCommunityIdByAuthorId("author1");
    verify(communityRepository).findCommunityIdByAuthorId("author2");
    verify(communityRepository).findAuthorsByCommunityWithLimit(1, 10);
    ArgumentCaptor<NodeDto> nodeCaptor = ArgumentCaptor.forClass(NodeDto.class);
    verify(workspaceService, times(2)).updateWorkspaceMembership(nodeCaptor.capture(), eq(true));
  }

  @Test
  void testAddAuthorsCommunities_WithoutNodeNumber() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    Author communityAuthor = new Author();
    communityAuthor.setUserName("commAuthor");

    when(communityRepository.findCommunityIdByAuthorId("author1")).thenReturn(Optional.of(1));
    when(communityRepository.findAuthorsByCommunity(1)).thenReturn(Arrays.asList(communityAuthor));

    // Act
    graphMenuService.addAuthorsCommunities(authors, Optional.empty());

    // Assert
    verify(communityRepository).findAuthorsByCommunity(1);
    ArgumentCaptor<NodeDto> nodeCaptor = ArgumentCaptor.forClass(NodeDto.class);
    verify(workspaceService).updateWorkspaceMembership(nodeCaptor.capture(), eq(true));
  }

  @Test
  void testAddAuthorsCommunities_MultipleCommunities() {
    // Arrange
    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setName("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setName("author2");
    List<AuthorNodeDto> authors = Arrays.asList(author1, author2);

    Author commAuthor1 = new Author();
    commAuthor1.setUserName("commAuthor1");
    Author commAuthor2 = new Author();
    commAuthor2.setUserName("commAuthor2");

    when(communityRepository.findCommunityIdByAuthorId("author1")).thenReturn(Optional.of(1));
    when(communityRepository.findCommunityIdByAuthorId("author2")).thenReturn(Optional.of(2));
    when(communityRepository.findAuthorsByCommunity(1)).thenReturn(Arrays.asList(commAuthor1));
    when(communityRepository.findAuthorsByCommunity(2)).thenReturn(Arrays.asList(commAuthor2));

    // Act
    graphMenuService.addAuthorsCommunities(authors, Optional.empty());

    // Assert
    verify(communityRepository).findAuthorsByCommunity(1);
    verify(communityRepository).findAuthorsByCommunity(2);
    ArgumentCaptor<NodeDto> nodeCaptor = ArgumentCaptor.forClass(NodeDto.class);
    verify(workspaceService, times(2)).updateWorkspaceMembership(nodeCaptor.capture(), eq(true));
  }

  @Test
  void testAddAuthorsCommunities_AuthorWithoutCommunity() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    when(communityRepository.findCommunityIdByAuthorId("author1")).thenReturn(Optional.empty());

    // Act
    graphMenuService.addAuthorsCommunities(authors, Optional.empty());

    // Assert
    verify(communityRepository).findCommunityIdByAuthorId("author1");
    verify(communityRepository, never()).findAuthorsByCommunity(anyInt());
    verify(workspaceService, never()).updateWorkspaceMembership(any(NodeDto.class), anyBoolean());
  }

  @Test
  void testAddHashtagsUsedByAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    HashtagNodeDto hashtag1 = new HashtagNodeDto();
    hashtag1.setId("java");
    HashtagNodeDto hashtag2 = new HashtagNodeDto();
    hashtag2.setId("spring");

    when(graphMenuRepository.findHashtagsUsedByAuthor("author1"))
        .thenReturn(Arrays.asList(hashtag1, hashtag2));

    // Act
    graphMenuService.addHashtagsUsedByAuthors(authors);

    // Assert
    verify(graphMenuRepository).findHashtagsUsedByAuthor("author1");
    verify(workspaceService, times(2))
        .updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddCommonHashtagUsedByAuthors_Success() {
    // Arrange
    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setName("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setName("author2");
    List<AuthorNodeDto> authors = Arrays.asList(author1, author2);

    HashtagNodeDto commonHashtag = new HashtagNodeDto();
    commonHashtag.setId("java");

    when(graphMenuRepository.findTopCommonHashtagsUsedByAuthors(Arrays.asList("author1", "author2")))
        .thenReturn(Arrays.asList(commonHashtag));

    // Act
    graphMenuService.addCommonHashtagUsedByAuthors(authors);

    // Assert
    verify(graphMenuRepository)
        .findTopCommonHashtagsUsedByAuthors(Arrays.asList("author1", "author2"));
    verify(workspaceService).updateWorkspaceMembership(commonHashtag, true);
  }

  @Test
  void testAddMentionedUsersByAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    AuthorNodeDto mentioned1 = new AuthorNodeDto();
    mentioned1.setId("mentioned1");
    AuthorNodeDto mentioned2 = new AuthorNodeDto();
    mentioned2.setId("mentioned2");

    when(graphMenuRepository.findMentionedUsersByAuthor("author1"))
        .thenReturn(Arrays.asList(mentioned1, mentioned2));

    // Act
    graphMenuService.addMentionedUsersByAuthors(authors);

    // Assert
    verify(graphMenuRepository).findMentionedUsersByAuthor("author1");
    verify(workspaceService, times(2))
        .updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddAuthorsMentioningTheseAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    AuthorNodeDto mentioning = new AuthorNodeDto();
    mentioning.setId("mentioning1");

    when(graphMenuRepository.findAuthorsMentioningThisAuthor("author1"))
        .thenReturn(Arrays.asList(mentioning));

    // Act
    graphMenuService.addAuthorsMentioningTheseAuthors(authors);

    // Assert
    verify(graphMenuRepository).findAuthorsMentioningThisAuthor("author1");
    verify(workspaceService).updateWorkspaceMembership(mentioning, true);
  }

  @Test
  void testAddAuthorsMostRepliedToByAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    AuthorNodeDto repliedTo = new AuthorNodeDto();
    repliedTo.setId("repliedTo1");

    when(graphMenuRepository.findAuthorsMostRepliedToByAuthor("author1"))
        .thenReturn(Arrays.asList(repliedTo));

    // Act
    graphMenuService.addAuthorsMostRepliedToByAuthors(authors);

    // Assert
    verify(graphMenuRepository).findAuthorsMostRepliedToByAuthor("author1");
    verify(workspaceService).updateWorkspaceMembership(repliedTo, true);
  }

  @Test
  void testAddAuthorsMostReplyingToAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    AuthorNodeDto replying = new AuthorNodeDto();
    replying.setId("replying1");

    when(graphMenuRepository.findAuthorsMostReplyingToAuthor("author1"))
        .thenReturn(Arrays.asList(replying));

    // Act
    graphMenuService.addAuthorsMostReplyingToAuthors(authors);

    // Assert
    verify(graphMenuRepository).findAuthorsMostReplyingToAuthor("author1");
    verify(workspaceService).updateWorkspaceMembership(replying, true);
  }

  @Test
  void testAddTweetsRepliedToByAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");

    when(graphMenuRepository.findTweetsRepliedToByAuthor("author1"))
        .thenReturn(Arrays.asList(tweet));

    // Act
    graphMenuService.addTweetsRepliedToByAuthors(authors);

    // Assert
    verify(graphMenuRepository).findTweetsRepliedToByAuthor("author1");
    verify(workspaceService).updateWorkspaceMembership(tweet, true);
  }

  @Test
  void testAddTweetsMentioningAuthors_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");

    when(graphMenuRepository.findTweetsMentioningAuthor("author1"))
        .thenReturn(Arrays.asList(tweet));

    // Act
    graphMenuService.addTweetsMentioningAuthors(authors);

    // Assert
    verify(graphMenuRepository).findTweetsMentioningAuthor("author1");
    verify(workspaceService).updateWorkspaceMembership(tweet, true);
  }

  @Test
  void testAddTweetAuthorsToWorkspace_Success() {
    // Arrange
    TweetNodeDto tweet1 = new TweetNodeDto();
    tweet1.setId("tweet1");
    TweetNodeDto tweet2 = new TweetNodeDto();
    tweet2.setId("tweet2");
    List<TweetNodeDto> tweets = Arrays.asList(tweet1, tweet2);

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    when(graphMenuRepository.findAuthorByTweetId("tweet1")).thenReturn(Optional.of(author1));
    when(graphMenuRepository.findAuthorByTweetId("tweet2")).thenReturn(Optional.of(author2));

    // Act
    graphMenuService.addTweetAuthorsToWorkspace(tweets);

    // Assert
    verify(graphMenuRepository).findAuthorByTweetId("tweet1");
    verify(graphMenuRepository).findAuthorByTweetId("tweet2");
    verify(workspaceService, times(2))
        .updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddTweetAuthorsToWorkspace_AuthorNotFound() {
    // Arrange
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    List<TweetNodeDto> tweets = Arrays.asList(tweet);

    when(graphMenuRepository.findAuthorByTweetId("tweet1")).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class, () -> graphMenuService.addTweetAuthorsToWorkspace(tweets));
    assertTrue(exception.getMessage().contains("Author not found for tweet: tweet1"));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    verify(graphMenuRepository).findAuthorByTweetId("tweet1");
    verify(workspaceService, never()).updateWorkspaceMembership(any(NodeDto.class), anyBoolean());
  }

  @Test
  void testAddTweetHashtagsToWorkspace_Success() {
    // Arrange
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    List<TweetNodeDto> tweets = Arrays.asList(tweet);

    HashtagNodeDto hashtag1 = new HashtagNodeDto();
    hashtag1.setId("java");
    HashtagNodeDto hashtag2 = new HashtagNodeDto();
    hashtag2.setId("spring");

    when(graphMenuRepository.findHashtagsByTweetId("tweet1"))
        .thenReturn(Arrays.asList(hashtag1, hashtag2));

    // Act
    graphMenuService.addTweetHashtagsToWorkspace(tweets);

    // Assert
    verify(graphMenuRepository).findHashtagsByTweetId("tweet1");
    verify(workspaceService, times(2))
        .updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddTweetsCommonHashtagsToWorkspace_Success() {
    // Arrange
    TweetNodeDto tweet1 = new TweetNodeDto();
    tweet1.setId("tweet1");
    TweetNodeDto tweet2 = new TweetNodeDto();
    tweet2.setId("tweet2");
    List<TweetNodeDto> tweets = Arrays.asList(tweet1, tweet2);

    HashtagNodeDto commonHashtag = new HashtagNodeDto();
    commonHashtag.setId("java");

    when(graphMenuRepository.findCommonHashtagsByTweetIds(Arrays.asList("tweet1", "tweet2")))
        .thenReturn(Arrays.asList(commonHashtag));

    // Act
    graphMenuService.addTweetsCommonHashtagsToWorkspace(tweets);

    // Assert
    verify(graphMenuRepository).findCommonHashtagsByTweetIds(Arrays.asList("tweet1", "tweet2"));
    verify(workspaceService).updateWorkspaceMembership(commonHashtag, true);
  }

  @Test
  void testAddMentionedAuthorsFromTweets_Success() {
    // Arrange
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    List<TweetNodeDto> tweets = Arrays.asList(tweet);

    AuthorNodeDto mentioned = new AuthorNodeDto();
    mentioned.setId("mentioned1");

    when(graphMenuRepository.findMentionedAuthorsByTweetId("tweet1"))
        .thenReturn(Arrays.asList(mentioned));

    // Act
    graphMenuService.addMentionedAuthorsFromTweets(tweets);

    // Assert
    verify(graphMenuRepository).findMentionedAuthorsByTweetId("tweet1");
    verify(workspaceService).updateWorkspaceMembership(mentioned, true);
  }

  @Test
  void testAddParentTweetsToWorkspace_Success() {
    // Arrange
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    List<TweetNodeDto> tweets = Arrays.asList(tweet);

    TweetNodeDto parent = new TweetNodeDto();
    parent.setId("parent1");

    when(graphMenuRepository.findParentByTweetId("tweet1")).thenReturn(Optional.of(parent));

    // Act
    graphMenuService.addParentTweetsToWorkspace(tweets);

    // Assert
    verify(graphMenuRepository).findParentByTweetId("tweet1");
    verify(workspaceService).updateWorkspaceMembership(parent, true);
  }

  @Test
  void testAddParentTweetsToWorkspace_ParentNotFound() {
    // Arrange
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    List<TweetNodeDto> tweets = Arrays.asList(tweet);

    when(graphMenuRepository.findParentByTweetId("tweet1")).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class, () -> graphMenuService.addParentTweetsToWorkspace(tweets));
    assertTrue(exception.getMessage().contains("Parent not found for tweet: tweet1"));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    verify(graphMenuRepository).findParentByTweetId("tweet1");
    verify(workspaceService, never()).updateWorkspaceMembership(any(NodeDto.class), anyBoolean());
  }

  @Test
  void testAddTweetChildrenToWorkspace_Success() {
    // Arrange
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    List<TweetNodeDto> tweets = Arrays.asList(tweet);

    TweetNodeDto child1 = new TweetNodeDto();
    child1.setId("child1");
    TweetNodeDto child2 = new TweetNodeDto();
    child2.setId("child2");

    when(graphMenuRepository.findChildrenByTweetId("tweet1"))
        .thenReturn(Arrays.asList(child1, child2));

    // Act
    graphMenuService.addTweetChildrenToWorkspace(tweets);

    // Assert
    verify(graphMenuRepository).findChildrenByTweetId("tweet1");
    verify(workspaceService, times(2)).updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddTopAuthorsForHashtags_Success() {
    // Arrange
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setName("java");
    List<HashtagNodeDto> hashtags = Arrays.asList(hashtag);

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    when(graphMenuRepository.findTopAuthorsByHashtag("java"))
        .thenReturn(Arrays.asList(author1, author2));

    // Act
    graphMenuService.addTopAuthorsForHashtags(hashtags);

    // Assert
    verify(graphMenuRepository).findTopAuthorsByHashtag("java");
    verify(workspaceService, times(2))
        .updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddTopTweetsByHashtags_Success() {
    // Arrange
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setName("java");
    List<HashtagNodeDto> hashtags = Arrays.asList(hashtag);

    TweetNodeDto tweet1 = new TweetNodeDto();
    tweet1.setId("tweet1");
    TweetNodeDto tweet2 = new TweetNodeDto();
    tweet2.setId("tweet2");

    when(graphMenuRepository.findTopTweetsByHashtag("java"))
        .thenReturn(Arrays.asList(tweet1, tweet2));

    // Act
    graphMenuService.addTopTweetsByHashtags(hashtags);

    // Assert
    verify(graphMenuRepository).findTopTweetsByHashtag("java");
    verify(workspaceService, times(2)).updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddRelatedHashtags_Success() {
    // Arrange
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setName("java");
    List<HashtagNodeDto> hashtags = Arrays.asList(hashtag);

    HashtagNodeDto related1 = new HashtagNodeDto();
    related1.setId("spring");
    HashtagNodeDto related2 = new HashtagNodeDto();
    related2.setId("hibernate");

    when(graphMenuRepository.findRelatedHashtags("java"))
        .thenReturn(Arrays.asList(related1, related2));

    // Act
    graphMenuService.addRelatedHashtags(hashtags);

    // Assert
    verify(graphMenuRepository).findRelatedHashtags("java");
    verify(workspaceService, times(2))
        .updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddAuthorsLatestTweets_MultipleAuthorsAndTweets() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    TweetNodeDto tweet1 = new TweetNodeDto();
    tweet1.setId("tweet1");
    TweetNodeDto tweet2 = new TweetNodeDto();
    tweet2.setId("tweet2");
    TweetNodeDto tweet3 = new TweetNodeDto();
    tweet3.setId("tweet3");

    when(graphMenuRepository.findAuthorLatestTweets("author1", 10))
        .thenReturn(Arrays.asList(tweet1, tweet2, tweet3));

    // Act
    graphMenuService.addAuthorsLatestTweets(authors, 10);

    // Assert
    verify(workspaceService, times(3)).updateWorkspaceMembership(any(NodeDto.class), eq(true));
  }

  @Test
  void testAddAuthorsCommunities_SetsCorrectNodeType() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setName("author1");
    List<AuthorNodeDto> authors = Arrays.asList(author);

    Author communityAuthor = new Author();
    communityAuthor.setId("authorId123");
    communityAuthor.setUserName("commAuthor");

    when(communityRepository.findCommunityIdByAuthorId("author1")).thenReturn(Optional.of(1));
    when(communityRepository.findAuthorsByCommunity(1)).thenReturn(Arrays.asList(communityAuthor));

    ArgumentCaptor<NodeDto> nodeCaptor = ArgumentCaptor.forClass(NodeDto.class);

    // Act
    graphMenuService.addAuthorsCommunities(authors, Optional.empty());

    // Assert
    verify(workspaceService).updateWorkspaceMembership(nodeCaptor.capture(), eq(true));
    NodeDto capturedNode = nodeCaptor.getValue();
    assertEquals(NodeType.AUTHOR, capturedNode.getNodeType());
    assertEquals("authorId123", capturedNode.getId());
    assertEquals("commAuthor", capturedNode.getName());
  }
}

