package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.dto.request.BridgesRequest;
import com.example.social_network_visualizer_backend.dto.request.FetchConfig;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
import com.example.social_network_visualizer_backend.dto.request.ShortestPathRequest;
import com.example.social_network_visualizer_backend.enums.AlgorithmType;
import com.example.social_network_visualizer_backend.enums.FetchStrategy;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.GraphRepository;
import com.example.social_network_visualizer_backend.service.graph.NodeQueryStrategy;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GraphServiceTest {

  @Mock private GraphRepository graphRepository;

  @Mock private AuthorRepository authorRepository;

  @Mock private MetricComputationService metricComputationService;

  @Mock private NodeQueryStrategy authorStrategy;

  @Mock private NodeQueryStrategy tweetStrategy;

  @Mock private NodeQueryStrategy hashtagStrategy;

  @InjectMocks private GraphService graphService;

  private List<NodeQueryStrategy> strategies;

  @BeforeEach
  void setUp() {
    strategies = Arrays.asList(authorStrategy, tweetStrategy, hashtagStrategy);
    graphService = new GraphService(graphRepository, authorRepository, strategies, metricComputationService);

    lenient().when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    lenient().when(tweetStrategy.getNodeType()).thenReturn(NodeType.TWEET);
    lenient().when(hashtagStrategy.getNodeType()).thenReturn(NodeType.HASHTAG);
  }

  @Test
  void testGetGraph_Success() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    FetchConfig fetchConfig = FetchConfig.defaultConfig();
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    LinkDto link1 = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);

    doReturn(Arrays.asList(author1, author2))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Arrays.asList(link1));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.nodes().size());
    assertEquals(1, result.links().size());
    verify(authorStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    verify(graphRepository).findAllRelations();
  }

  @Test
  void testGetGraph_WithCommunityId() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    FetchConfig fetchConfig = FetchConfig.defaultConfig();
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.of(1));

    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    LinkDto link = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);

    doReturn(Arrays.asList(author, author2))
        .when(authorStrategy)
        .fetchNodes(Optional.of(1), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Arrays.asList(link));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.nodes().size());
    assertEquals(1, result.links().size());
    verify(authorStrategy).fetchNodes(Optional.of(1), false, Integer.MAX_VALUE);
    verify(graphRepository).findAllRelations();
  }

  @Test
  void testGetGraph_NullNodeTypes_UsesDefaults() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(null, null, null, Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    LinkDto link = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);

    doReturn(Arrays.asList(author1, author2))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Arrays.asList(link));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.nodes().size());
    assertEquals(1, result.links().size());
    verify(authorStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
  }

  @Test
  void testGetGraph_EmptyNodeTypes_ReturnsEmptyNodes() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(Set.of(), Set.of(), null, Optional.empty());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.nodes().size());
    assertEquals(0, result.links().size());
  }

  @Test
  void testGetGraph_MultipleNodeTypes() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    FetchConfig fetchConfig = FetchConfig.defaultConfig();
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.empty());

    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setId("hashtag1");

    doReturn(Arrays.asList(author))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    doReturn(Arrays.asList(tweet))
        .when(tweetStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    doReturn(Arrays.asList(hashtag))
        .when(hashtagStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.nodes().size());
    verify(authorStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    verify(tweetStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    verify(hashtagStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
  }

  @Test
  void testGetGraph_WithDuplicateNodes() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    FetchConfig fetchConfig = FetchConfig.defaultConfig();
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    author1.setPagerank(0.5);
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");
    author2.setPagerank(0.7);
    AuthorNodeDto author3 = new AuthorNodeDto();
    author3.setId("author3");

    doReturn(Arrays.asList(author1, author2, author3))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.nodes().size());
  }

  @Test
  void testGetGraph_WithCustomFetchConfig() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 10);
    FetchConfig fetchConfig = FetchConfig.withLimits(limits);
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.empty());

    doReturn(Collections.emptyList())
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, 10);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    verify(authorStrategy).fetchNodes(Optional.empty(), false, 10);
  }

  @Test
  void testGetGraph_FiltersLinksByRelationType() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    FetchConfig fetchConfig = FetchConfig.defaultConfig();
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    LinkDto mentionLink = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);
    LinkDto retweetLink = new LinkDto("author1", "author3", RelationType.RETWEETS, 3);

    doReturn(Arrays.asList(author1, author2))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Arrays.asList(mentionLink, retweetLink));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.links().size());
    assertEquals(RelationType.MENTIONS, result.links().get(0).relation());
  }

  @Test
  void testGetGraph_MultipleRelationTypes() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS, RelationType.RETWEETS);
    FetchConfig fetchConfig = FetchConfig.defaultConfig();
    GraphQueryRequest request = new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig, Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");
    AuthorNodeDto author3 = new AuthorNodeDto();
    author3.setId("author3");

    LinkDto mentionLink = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);
    LinkDto retweetLink = new LinkDto("author1", "author3", RelationType.RETWEETS, 3);

    doReturn(Arrays.asList(author1, author2, author3))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Arrays.asList(mentionLink, retweetLink));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.links().size());
  }

  @Test
  void testFetchWorkspaceData_Success() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setId("hashtag1");

    LinkDto link = new LinkDto("author1", "tweet1", RelationType.POSTED, 1);

    doReturn(Arrays.asList(author))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    doReturn(Arrays.asList(tweet))
        .when(tweetStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    doReturn(Arrays.asList(hashtag))
        .when(hashtagStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    when(graphRepository.findWorkspaceRelationships()).thenReturn(Arrays.asList(link));

    // Act
    GraphDataDto result = graphService.fetchWorkspaceData();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.nodes().size());
    assertEquals(1, result.links().size());
    verify(authorStrategy).fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    verify(tweetStrategy).fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    verify(hashtagStrategy).fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    verify(graphRepository).findWorkspaceRelationships();
  }

  @Test
  void testFetchWorkspaceData_EmptyData() {
    // Arrange
    doReturn(Collections.emptyList())
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    doReturn(Collections.emptyList())
        .when(tweetStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    doReturn(Collections.emptyList())
        .when(hashtagStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    when(graphRepository.findWorkspaceRelationships()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.fetchWorkspaceData();

    // Assert
    assertNotNull(result);
    assertTrue(result.nodes().isEmpty());
    assertTrue(result.links().isEmpty());
  }

  @Test
  void testGetSuggestions_Success() {
    // Arrange
    String query = "test";
    NodeSearchDto suggestion1 = new NodeSearchDto();
    suggestion1.setId("result1");
    NodeSearchDto suggestion2 = new NodeSearchDto();
    suggestion2.setId("result2");

    when(graphRepository.performSearch(query)).thenReturn(Arrays.asList(suggestion1, suggestion2));

    // Act
    List<NodeSearchDto> result = graphService.getSuggestions(query);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("result1", result.get(0).getId());
    verify(graphRepository).performSearch(query);
  }

  @Test
  void testGetSuggestions_EmptyQuery() {
    // Arrange
    String query = "";
    when(graphRepository.performSearch(query)).thenReturn(Collections.emptyList());

    // Act
    List<NodeSearchDto> result = graphService.getSuggestions(query);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(graphRepository).performSearch(query);
  }

  @Test
  void testGetSuggestions_NoResults() {
    // Arrange
    String query = "nonexistent";
    when(graphRepository.performSearch(query)).thenReturn(Collections.emptyList());

    // Act
    List<NodeSearchDto> result = graphService.getSuggestions(query);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(graphRepository).performSearch(query);
  }

  @Test
  void testFindStrategyForNodeType_AuthorType() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");

    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    GraphQueryRequest request =
        new GraphQueryRequest(nodeTypes, relationTypes, FetchConfig.defaultConfig(), Optional.empty());

    doReturn(Arrays.asList(author))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    verify(authorStrategy).getNodeType();
    verify(authorStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
  }

  @Test
  void testValidateRequest_NullValues_SetsDefaults() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(null, null, null, Optional.empty());

    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");

    doReturn(Arrays.asList(author))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.nodes().size());
    verify(authorStrategy).fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
  }

  @Test
  void testGetGraph_WithNullNodeId() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    GraphQueryRequest request =
        new GraphQueryRequest(nodeTypes, relationTypes, FetchConfig.defaultConfig(), Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId(null);
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");

    doReturn(Arrays.asList(author1, author2))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.nodes().size());
  }

  @Test
  void testGetGraph_WithCommunityAndMultipleRelationTypes() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS, RelationType.RETWEETS);
    GraphQueryRequest request =
        new GraphQueryRequest(nodeTypes, relationTypes, FetchConfig.defaultConfig(), Optional.of(1));

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");
    AuthorNodeDto author3 = new AuthorNodeDto();
    author3.setId("author3");

    LinkDto link1 = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);
    LinkDto link2 = new LinkDto("author1", "author3", RelationType.RETWEETS, 3);

    doReturn(Arrays.asList(author1, author2, author3))
        .when(authorStrategy)
        .fetchNodes(Optional.of(1), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Arrays.asList(link1, link2));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.links().size());
    verify(graphRepository).findAllRelations();
  }

  @Test
  void testGetGraph_LargeDataset() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    GraphQueryRequest request =
        new GraphQueryRequest(nodeTypes, relationTypes, FetchConfig.defaultConfig(), Optional.empty());

    List<NodeDto> largeNodeList = new ArrayList<>();
    for (int i = 0; i < 1000; i++) {
      AuthorNodeDto author = new AuthorNodeDto();
      author.setId("author" + i);
      largeNodeList.add(author);
    }

    doReturn(largeNodeList)
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1000, result.nodes().size());
  }

  @Test
  void testGetGraph_PreservesNodeOrder() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    GraphQueryRequest request =
        new GraphQueryRequest(nodeTypes, relationTypes, FetchConfig.defaultConfig(), Optional.empty());

    AuthorNodeDto author1 = new AuthorNodeDto();
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto();
    author2.setId("author2");
    AuthorNodeDto author3 = new AuthorNodeDto();
    author3.setId("author3");

    doReturn(Arrays.asList(author1, author2, author3))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.nodes().size());
    assertEquals("author1", result.nodes().get(0).getId());
    assertEquals("author2", result.nodes().get(1).getId());
    assertEquals("author3", result.nodes().get(2).getId());
  }

  @Test
  void testGetGraph_EmptyRelationTypes_ReturnsEmptyLinks() {
    // Arrange
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of();
    GraphQueryRequest request =
        new GraphQueryRequest(nodeTypes, relationTypes, FetchConfig.defaultConfig(), Optional.empty());

    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");

    doReturn(Arrays.asList(author))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), false, Integer.MAX_VALUE);
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.nodes().size());
    assertEquals(0, result.links().size());
  }

  @Test
  void testFetchWorkspaceData_FetchesAllNodeTypes() {
    // Arrange
    AuthorNodeDto author = new AuthorNodeDto();
    author.setId("author1");
    author.setNodeType(NodeType.AUTHOR);
    TweetNodeDto tweet = new TweetNodeDto();
    tweet.setId("tweet1");
    tweet.setNodeType(NodeType.TWEET);
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setId("hashtag1");
    hashtag.setNodeType(NodeType.HASHTAG);

    doReturn(Arrays.asList(author))
        .when(authorStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    doReturn(Arrays.asList(tweet))
        .when(tweetStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    doReturn(Arrays.asList(hashtag))
        .when(hashtagStrategy)
        .fetchNodes(Optional.empty(), true, Integer.MAX_VALUE);
    when(graphRepository.findWorkspaceRelationships()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.fetchWorkspaceData();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.nodes().size());
    assertTrue(result.nodes().stream().anyMatch(n -> "author1".equals(n.getId())));
    assertTrue(result.nodes().stream().anyMatch(n -> "tweet1".equals(n.getId())));
    assertTrue(result.nodes().stream().anyMatch(n -> "hashtag1".equals(n.getId())));
  }

  @Test
  void testGetShortestPath_Success() {
    // Arrange
    NodeDto sourceNode = createAuthorNode("author1", "Author 1");
    NodeDto targetNode = createAuthorNode("author2", "Author 2");
    ShortestPathRequest request = new ShortestPathRequest(
        sourceNode,
        targetNode,
        Set.of(NodeType.AUTHOR, NodeType.TWEET),
        Set.of(RelationType.POSTED, RelationType.MENTIONS)
    );
    List<NodeDto> expectedPath = List.of(
        sourceNode,
        createTweetNode("tweet1", "Tweet 1"),
        targetNode
    );
    when(metricComputationService.computeShortestPath(
        eq("shortest-path"),
        eq(AlgorithmType.SHORTEST_PATH),
        eq(request.nodeTypes()),
        eq(request.relationTypes()),
        eq(Orientation.NATURAL),
        eq(sourceNode),
        eq(targetNode)
    )).thenReturn(expectedPath);

    // Act
    List<NodeDto> result = graphService.getShortestPath(request);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals("author1", result.get(0).getId());
    assertEquals("tweet1", result.get(1).getId());
    assertEquals("author2", result.get(2).getId());
    verify(metricComputationService).computeShortestPath(
        eq("shortest-path"),
        eq(AlgorithmType.SHORTEST_PATH),
        eq(request.nodeTypes()),
        eq(request.relationTypes()),
        eq(Orientation.NATURAL),
        eq(sourceNode),
        eq(targetNode)
    );
  }

  @Test
  void testGetShortestPath_EmptyNodeTypes_UsesDefaults() {
    // Arrange
    NodeDto sourceNode = createAuthorNode("source", "Source");
    NodeDto targetNode = createAuthorNode("target", "Target");
    ShortestPathRequest request = new ShortestPathRequest(
        sourceNode,
        targetNode,
        Set.of(),
        Set.of(RelationType.POSTED)
    );
    List<NodeDto> expectedPath = List.of(sourceNode);
    when(metricComputationService.computeShortestPath(
        eq("shortest-path"),
        eq(AlgorithmType.SHORTEST_PATH),
        eq(new HashSet<>(Arrays.asList(NodeType.values()))),
        eq(request.relationTypes()),
        eq(Orientation.NATURAL),
        eq(sourceNode),
        eq(targetNode)
    )).thenReturn(expectedPath);

    // Act
    List<NodeDto> result = graphService.getShortestPath(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    verify(metricComputationService).computeShortestPath(
        eq("shortest-path"),
        eq(AlgorithmType.SHORTEST_PATH),
        eq(new HashSet<>(Arrays.asList(NodeType.values()))),
        eq(request.relationTypes()),
        eq(Orientation.NATURAL),
        eq(sourceNode),
        eq(targetNode)
    );
  }

  @Test
  void testGetShortestPath_EmptyRelationTypes_UsesDefaults() {
    // Arrange
    NodeDto sourceNode = createAuthorNode("source", "Source");
    NodeDto targetNode = createAuthorNode("target", "Target");
    ShortestPathRequest request = new ShortestPathRequest(
        sourceNode,
        targetNode,
        Set.of(NodeType.AUTHOR),
        Set.of()
    );
    List<NodeDto> expectedPath = List.of();
    when(metricComputationService.computeShortestPath(
        eq("shortest-path"),
        eq(AlgorithmType.SHORTEST_PATH),
        eq(request.nodeTypes()),
        eq(new HashSet<>(Arrays.asList(RelationType.values()))),
        eq(Orientation.NATURAL),
        eq(sourceNode),
        eq(targetNode)
    )).thenReturn(expectedPath);

    // Act
    List<NodeDto> result = graphService.getShortestPath(request);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(metricComputationService).computeShortestPath(
        eq("shortest-path"),
        eq(AlgorithmType.SHORTEST_PATH),
        eq(request.nodeTypes()),
        eq(new HashSet<>(Arrays.asList(RelationType.values()))),
        eq(Orientation.NATURAL),
        eq(sourceNode),
        eq(targetNode)
    );
  }

  @Test
  void testGetShortestPath_NoPathFound() {
    // Arrange
    NodeDto sourceNode = createAuthorNode("isolated1", "Isolated 1");
    NodeDto targetNode = createAuthorNode("isolated2", "Isolated 2");
    ShortestPathRequest request = new ShortestPathRequest(
        sourceNode,
        targetNode,
        Set.of(NodeType.AUTHOR),
        Set.of(RelationType.POSTED)
    );
    when(metricComputationService.computeShortestPath(
        anyString(),
        any(AlgorithmType.class),
        anySet(),
        anySet(),
        any(Orientation.class),
        any(NodeDto.class),
        any(NodeDto.class)
    )).thenReturn(Collections.emptyList());

    // Act
    List<NodeDto> result = graphService.getShortestPath(request);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void testGetBridges_Success() {
    // Arrange
    BridgesRequest request = new BridgesRequest(
        Set.of(NodeType.AUTHOR, NodeType.TWEET),
        Set.of(RelationType.POSTED, RelationType.REPLY_TO)
    );
    List<LinkDto> expectedBridges = List.of(
        new LinkDto("author1", "tweet1", RelationType.POSTED, 1),
        new LinkDto("tweet1", "tweet2", RelationType.REPLY_TO, 1)
    );
    when(metricComputationService.computeFindBridges(
        eq("bridges"),
        eq(AlgorithmType.BRIDGES),
        eq(request.nodeTypes()),
        eq(request.relationTypes()),
        eq(Orientation.UNDIRECTED)
    )).thenReturn(expectedBridges);

    // Act
    List<LinkDto> result = graphService.getBridges(request);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("author1", result.get(0).source());
    assertEquals("tweet1", result.get(0).target());
    assertEquals(RelationType.POSTED, result.get(0).relation());
    verify(metricComputationService).computeFindBridges(
        eq("bridges"),
        eq(AlgorithmType.BRIDGES),
        eq(request.nodeTypes()),
        eq(request.relationTypes()),
        eq(Orientation.UNDIRECTED)
    );
  }

  @Test
  void testGetBridges_EmptyNodeTypes_UsesDefaults() {
    // Arrange
    BridgesRequest request = new BridgesRequest(
        Set.of(),
        Set.of(RelationType.POSTED)
    );
    List<LinkDto> expectedBridges = List.of();
    when(metricComputationService.computeFindBridges(
        eq("bridges"),
        eq(AlgorithmType.BRIDGES),
        eq(new HashSet<>(Arrays.asList(NodeType.values()))),
        eq(request.relationTypes()),
        eq(Orientation.UNDIRECTED)
    )).thenReturn(expectedBridges);

    // Act
    List<LinkDto> result = graphService.getBridges(request);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(metricComputationService).computeFindBridges(
        eq("bridges"),
        eq(AlgorithmType.BRIDGES),
        eq(new HashSet<>(Arrays.asList(NodeType.values()))),
        eq(request.relationTypes()),
        eq(Orientation.UNDIRECTED)
    );
  }

  @Test
  void testGetBridges_EmptyRelationTypes_UsesDefaults() {
    // Arrange
    BridgesRequest request = new BridgesRequest(
        Set.of(NodeType.AUTHOR),
        Set.of()
    );
    List<LinkDto> expectedBridges = List.of();
    when(metricComputationService.computeFindBridges(
        eq("bridges"),
        eq(AlgorithmType.BRIDGES),
        eq(request.nodeTypes()),
        eq(new HashSet<>(Arrays.asList(RelationType.values()))),
        eq(Orientation.UNDIRECTED)
    )).thenReturn(expectedBridges);

    // Act
    List<LinkDto> result = graphService.getBridges(request);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(metricComputationService).computeFindBridges(
        eq("bridges"),
        eq(AlgorithmType.BRIDGES),
        eq(request.nodeTypes()),
        eq(new HashSet<>(Arrays.asList(RelationType.values()))),
        eq(Orientation.UNDIRECTED)
    );
  }

  @Test
  void testGetBridges_NoBridgesFound() {
    // Arrange
    BridgesRequest request = new BridgesRequest(
        Set.of(NodeType.AUTHOR),
        Set.of(RelationType.POSTED)
    );
    when(metricComputationService.computeFindBridges(
        anyString(),
        any(AlgorithmType.class),
        anySet(),
        anySet(),
        any(Orientation.class)
    )).thenReturn(Collections.emptyList());

    // Act
    List<LinkDto> result = graphService.getBridges(request);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void testGetGraph_WithEmptyNodesList() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(
        Set.of(NodeType.AUTHOR),
        Set.of(RelationType.MENTIONS),
        FetchConfig.defaultConfig(),
        Optional.empty()
    );
    when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    when(authorStrategy.fetchNodes(any(), anyBoolean(), anyInt()))
        .thenReturn(Collections.emptyList());
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertTrue(result.nodes().isEmpty());
    assertTrue(result.links().isEmpty());
  }

  @Test
  void testGetGraph_WithNoMatchingLinks() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(
        Set.of(NodeType.AUTHOR),
        Set.of(RelationType.MENTIONS),
        FetchConfig.defaultConfig(),
        Optional.empty()
    );
    AuthorNodeDto author = new AuthorNodeDto(0.5, 1);
    author.setId("author1");
    when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    doReturn(List.of(author))
        .when(authorStrategy).fetchNodes(any(), anyBoolean(), anyInt());
    LinkDto unmatchedLink = new LinkDto("author1", "author2", RelationType.RETWEETS, 1);
    when(graphRepository.findAllRelations()).thenReturn(List.of(unmatchedLink));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.nodes().size());
    assertTrue(result.links().isEmpty());
  }

  @Test
  void testGetGraph_LinksFilteredByNodeIds() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(
        Set.of(NodeType.AUTHOR),
        Set.of(RelationType.MENTIONS),
        FetchConfig.defaultConfig(),
        Optional.empty()
    );
    AuthorNodeDto author = new AuthorNodeDto(0.5, 1);
    author.setId("author1");
    when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    doReturn(List.of(author))
        .when(authorStrategy).fetchNodes(any(), anyBoolean(), anyInt());
    LinkDto linkWithMissingNodes = new LinkDto("author999", "author888", RelationType.MENTIONS, 1);
    when(graphRepository.findAllRelations()).thenReturn(List.of(linkWithMissingNodes));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.nodes().size());
    assertTrue(result.links().isEmpty());
  }

  @Test
  void testFetchWorkspaceData_WithEmptyResults() {
    // Arrange
    when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    when(tweetStrategy.getNodeType()).thenReturn(NodeType.TWEET);
    when(hashtagStrategy.getNodeType()).thenReturn(NodeType.HASHTAG);
    when(authorStrategy.fetchNodes(any(), eq(true), anyInt()))
        .thenReturn(Collections.emptyList());
    when(tweetStrategy.fetchNodes(any(), eq(true), anyInt()))
        .thenReturn(Collections.emptyList());
    when(hashtagStrategy.fetchNodes(any(), eq(true), anyInt()))
        .thenReturn(Collections.emptyList());
    when(graphRepository.findWorkspaceRelationships()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.fetchWorkspaceData();

    // Assert
    assertNotNull(result);
    assertTrue(result.nodes().isEmpty());
    assertTrue(result.links().isEmpty());
  }

  @Test
  void testGetGraph_WithCommunityIdFilter() {
    // Arrange
    GraphQueryRequest request = new GraphQueryRequest(
        Set.of(NodeType.AUTHOR),
        Set.of(RelationType.MENTIONS),
        FetchConfig.defaultConfig(),
        Optional.of(5)
    );
    AuthorNodeDto author = new AuthorNodeDto(0.5, 5);
    author.setId("author1");
    when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    doReturn(List.of(author))
        .when(authorStrategy).fetchNodes(eq(Optional.of(5)), anyBoolean(), anyInt());
    LinkDto link = new LinkDto("author1", "author1", RelationType.MENTIONS, 1);
    when(graphRepository.findAllRelations()).thenReturn(List.of(link));

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.nodes().size());
    assertEquals(1, result.links().size());
    verify(authorStrategy).fetchNodes(eq(Optional.of(5)), eq(false), anyInt());
  }

  @Test
  void testGetGraph_MultipleNodeTypesWithDifferentLimits() {
    // Arrange
    Map<NodeType, Integer> limits = Map.of(
        NodeType.AUTHOR, 50,
        NodeType.TWEET, 100,
        NodeType.HASHTAG, 200
    );
    FetchConfig customConfig = new FetchConfig(FetchStrategy.LIMIT_PER_TYPE, limits);
    GraphQueryRequest request = new GraphQueryRequest(
        Set.of(NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG),
        Set.of(RelationType.MENTIONS),
        customConfig,
        Optional.empty()
    );
    AuthorNodeDto author = new AuthorNodeDto(0.5, 1);
    author.setId("author1");
    TweetNodeDto tweet = new TweetNodeDto(null, null, null, null, null, null, null, null, null);
    tweet.setId("tweet1");
    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setId("hashtag1");
    
    when(authorStrategy.getNodeType()).thenReturn(NodeType.AUTHOR);
    when(tweetStrategy.getNodeType()).thenReturn(NodeType.TWEET);
    when(hashtagStrategy.getNodeType()).thenReturn(NodeType.HASHTAG);
    doReturn(List.of(author))
        .when(authorStrategy).fetchNodes(any(), anyBoolean(), eq(50));
    doReturn(List.of(tweet))
        .when(tweetStrategy).fetchNodes(any(), anyBoolean(), eq(100));
    doReturn(List.of(hashtag))
        .when(hashtagStrategy).fetchNodes(any(), anyBoolean(), eq(200));
    when(graphRepository.findAllRelations()).thenReturn(Collections.emptyList());

    // Act
    GraphDataDto result = graphService.getGraph(request);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.nodes().size());
    verify(authorStrategy).fetchNodes(any(), eq(false), eq(50));
    verify(tweetStrategy).fetchNodes(any(), eq(false), eq(100));
    verify(hashtagStrategy).fetchNodes(any(), eq(false), eq(200));
  }

  private AuthorNodeDto createAuthorNode(String id, String name) {
    AuthorNodeDto node = new AuthorNodeDto(null, null);
    node.setId(id);
    node.setName(name);
    node.setNodeType(NodeType.AUTHOR);
    return node;
  }

  private TweetNodeDto createTweetNode(String id, String content) {
    TweetNodeDto node = new TweetNodeDto(null, null, null, null, null, null, null, null, null);
    node.setId(id);
    node.setContent(content);
    node.setNodeType(NodeType.TWEET);
    return node;
  }
}

