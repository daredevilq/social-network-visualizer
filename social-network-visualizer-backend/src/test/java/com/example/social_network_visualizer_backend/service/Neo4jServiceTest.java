package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import com.example.social_network_visualizer_backend.repository.*;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class Neo4jServiceTest {

  @Mock private TweetRepository tweetRepository;

  @Mock private AuthorRepository authorRepository;

  @Mock private HashtagRepository hashtagRepository;

  @Mock private RelationshipRepository relationshipRepository;

  @Mock private GraphRepository graphRepository;

  @InjectMocks private Neo4jService neo4jService;

  @BeforeEach
  void setUp() {
    reset(
        tweetRepository,
        authorRepository,
        hashtagRepository,
        relationshipRepository,
        graphRepository);
  }

  @Test
  void testHandleDatabaseDrop_Success() {
    // Arrange
    List<String> gdsGraphs = Arrays.asList("graph1", "graph2", "graph3");
    when(graphRepository.listGdsGraphs()).thenReturn(gdsGraphs);

    // Act
    neo4jService.handleDatabaseDrop();

    // Assert
    verify(graphRepository, times(1)).deleteAllNodes();
    verify(graphRepository, times(1)).listGdsGraphs();
    verify(graphRepository, times(1)).dropGdsGraph("graph1");
    verify(graphRepository, times(1)).dropGdsGraph("graph2");
    verify(graphRepository, times(1)).dropGdsGraph("graph3");
  }

  @Test
  void testHandleDatabaseDrop_NoGdsGraphs() {
    // Arrange
    List<String> emptyGdsGraphs = List.of();
    when(graphRepository.listGdsGraphs()).thenReturn(emptyGdsGraphs);

    // Act
    neo4jService.handleDatabaseDrop();

    // Assert
    verify(graphRepository, times(1)).deleteAllNodes();
    verify(graphRepository, times(1)).listGdsGraphs();
    verify(graphRepository, never()).dropGdsGraph(anyString());
  }

  @Test
  void testDropAllGdsGraphs_Success() {
    // Arrange
    List<String> gdsGraphs = Arrays.asList("graphA", "graphB");
    when(graphRepository.listGdsGraphs()).thenReturn(gdsGraphs);

    // Act
    neo4jService.dropAllGdsGraphs();

    // Assert
    verify(graphRepository, times(1)).listGdsGraphs();
    verify(graphRepository, times(1)).dropGdsGraph("graphA");
    verify(graphRepository, times(1)).dropGdsGraph("graphB");
  }

  @Test
  void testDropAllGdsGraphs_EmptyList() {
    // Arrange
    when(graphRepository.listGdsGraphs()).thenReturn(List.of());

    // Act
    neo4jService.dropAllGdsGraphs();

    // Assert
    verify(graphRepository, times(1)).listGdsGraphs();
    verify(graphRepository, never()).dropGdsGraph(anyString());
  }

  @Test
  void testWaitForNeo4jToBeAvailable_SuccessOnFirstAttempt() {
    // Arrange
    when(tweetRepository.count()).thenReturn(0L);

    // Act
    neo4jService.waitForNeo4jToBeAvailable();

    // Assert
    verify(tweetRepository, times(1)).count();
  }

  @Test
  void testWaitForNeo4jToBeAvailable_SuccessAfterRetries() {
    // Arrange
    when(tweetRepository.count())
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenReturn(0L);

    // Act
    neo4jService.waitForNeo4jToBeAvailable();

    // Assert
    verify(tweetRepository, times(3)).count();
  }

  @Test
  void testWaitForNeo4jToBeAvailable_ThrowsExceptionAfterMaxAttempts() {
    // Arrange
    when(tweetRepository.count()).thenThrow(new RuntimeException("Connection failed"));

    // Act & Assert
    DatabaseUnavailableException exception =
        assertThrows(
            DatabaseUnavailableException.class, () -> neo4jService.waitForNeo4jToBeAvailable());

    assertTrue(exception.getMessage().contains("Neo4j is not available after"));
    assertTrue(exception.getMessage().contains("10 attempts"));
    verify(tweetRepository, times(10)).count();
  }

  @Test
  void testWaitForNeo4jToBeAvailable_HandlesInterruptedException() {
    // Arrange
    when(tweetRepository.count()).thenThrow(new RuntimeException("Connection failed"));
    Thread.currentThread().interrupt();

    // Act
    neo4jService.waitForNeo4jToBeAvailable();

    // Assert
    assertTrue(Thread.currentThread().isInterrupted());
    verify(tweetRepository, atLeastOnce()).count();
  }

  @Test
  void testCreateRelationsInGraph_Success() {
    // Act
    neo4jService.createAdditionalRelationsInGraph();

    // Assert
    verify(relationshipRepository, times(1)).createRelationshipAuthorMentionsAuthor();
    verify(relationshipRepository, times(1)).createRelationshipAuthorRetweetAuthor();
    verify(relationshipRepository, times(1)).createRelationshipAuthorRepliesAuthor();
    verify(relationshipRepository, times(1)).createRelationshipAuthorUsesHashtag();
    verify(relationshipRepository, times(1)).createRelationshipAuthorsShareHashtag();
    verify(relationshipRepository, times(1)).createQuoteRelationships();
    verify(relationshipRepository, times(1)).createRetweetRelationships();
    verify(relationshipRepository, times(1)).createReplyToRelationships();
    verify(relationshipRepository, times(1)).createIndexForCommunity();
  }

  @Test
  void testCreateRelationsInGraph_VerifyOrder() {
    // Act
    neo4jService.createAdditionalRelationsInGraph();

    // Assert
    var inOrder = inOrder(relationshipRepository);
    inOrder.verify(relationshipRepository).createRelationshipAuthorMentionsAuthor();
    inOrder.verify(relationshipRepository).createRelationshipAuthorRetweetAuthor();
    inOrder.verify(relationshipRepository).createRelationshipAuthorRepliesAuthor();
    inOrder.verify(relationshipRepository).createRelationshipAuthorUsesHashtag();
    inOrder.verify(relationshipRepository).createRelationshipAuthorsShareHashtag();
    inOrder.verify(relationshipRepository).createQuoteRelationships();
    inOrder.verify(relationshipRepository).createRetweetRelationships();
    inOrder.verify(relationshipRepository).createReplyToRelationships();
    inOrder.verify(relationshipRepository).createIndexForCommunity();
  }

  @Test
  void testCreateConstraints_Success() {
    // Act
    neo4jService.createConstraints();

    // Assert
    verify(tweetRepository, times(1)).createTweetIdConstraint();
    verify(authorRepository, times(1)).createAuthorUserNameConstraint();
    verify(hashtagRepository, times(1)).createHashtagConstraint();
  }

  @Test
  void testCreateConstraints_VerifyOrder() {
    // Act
    neo4jService.createConstraints();

    // Assert
    var inOrder = inOrder(tweetRepository, authorRepository, hashtagRepository);
    inOrder.verify(tweetRepository).createTweetIdConstraint();
    inOrder.verify(authorRepository).createAuthorUserNameConstraint();
    inOrder.verify(hashtagRepository).createHashtagConstraint();
  }

  @Test
  void testCreateConstraints_WithException() {
    // Arrange
    doThrow(new RuntimeException("Constraint creation failed"))
        .when(tweetRepository)
        .createTweetIdConstraint();

    // Act & Assert
    assertThrows(RuntimeException.class, () -> neo4jService.createConstraints());
    verify(tweetRepository, times(1)).createTweetIdConstraint();
    verify(authorRepository, never()).createAuthorUserNameConstraint();
    verify(hashtagRepository, never()).createHashtagConstraint();
  }
}
