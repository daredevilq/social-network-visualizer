package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.AlgorithmType;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.repository.AlgorithmRepository;
import com.example.social_network_visualizer_backend.repository.GraphRepository;
import com.example.social_network_visualizer_backend.service.metric.MetricComputationStrategy;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MetricComputationServiceTest {

  @Mock private GraphRepository graphRepository;

  @Mock private AlgorithmRepository algorithmRepository;

  @Mock private MetricComputationStrategy pageRankStrategy;

  @Mock private MetricComputationStrategy communityStrategy;

  @InjectMocks private MetricComputationService metricComputationService;

  @Test
  void testComputeMetrics_Success() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(pageRankStrategy).compute(anyString());
    verify(graphRepository).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_NullConfig() {
    // Arrange
    String projectName = "TestProject";

    // Act
    metricComputationService.computeMetrics(projectName, null);

    // Assert
    verify(graphRepository, never()).createGraph(anyString(), anyList(), anyMap());
    verify(pageRankStrategy, never()).compute(anyString());
  }

  @Test
  void testComputeMetrics_EmptyMetrics() {
    // Arrange
    String projectName = "TestProject";
    ProjectConfig config = new ProjectConfig(Instant.now(), Collections.emptyList());

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository, never()).createGraph(anyString(), anyList(), anyMap());
    verify(pageRankStrategy, never()).compute(anyString());
  }

  @Test
  void testComputeMetrics_NullMetricsList() {
    // Arrange
    String projectName = "TestProject";
    ProjectConfig config = new ProjectConfig(Instant.now(), null);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository, never()).createGraph(anyString(), anyList(), anyMap());
  }

  @Test
  void testComputeMetrics_MultipleMetrics() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL),
            new MetricConfig(
                MetricType.COMMUNITY,
                Set.of(NodeType.AUTHOR, NodeType.TWEET),
                Set.of(RelationType.POSTED),
                Orientation.UNDIRECTED));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy, communityStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);
    when(communityStrategy.getMetricType()).thenReturn(MetricType.COMMUNITY);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository, times(2)).createGraph(anyString(), anyList(), anyMap());
    verify(pageRankStrategy).compute(anyString());
    verify(communityStrategy).compute(anyString());
    verify(graphRepository, times(2)).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_StrategyThrowsException() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);
    doThrow(new RuntimeException("Strategy error")).when(pageRankStrategy).compute(anyString());

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> metricComputationService.computeMetrics(projectName, config));
    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(pageRankStrategy).compute(anyString());
    verify(graphRepository).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_NoStrategyFound() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = new ArrayList<>();

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> metricComputationService.computeMetrics(projectName, config));
    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(graphRepository).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_VerifiesGraphName() {
    // Arrange
    String projectName = "Test-Project_123";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<String> graphNameCaptor = ArgumentCaptor.forClass(String.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(graphNameCaptor.capture(), anyList(), anyMap());
    String capturedGraphName = graphNameCaptor.getValue();
    assertEquals("g_test_project_123_pagerank", capturedGraphName);
  }

  @Test
  void testComputeMetrics_VerifiesNodeLabels() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR, NodeType.TWEET),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<List<String>> labelsCaptor = ArgumentCaptor.forClass(List.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(anyString(), labelsCaptor.capture(), anyMap());
    List<String> capturedLabels = labelsCaptor.getValue();
    assertEquals(2, capturedLabels.size());
    assertTrue(capturedLabels.contains("Author"));
    assertTrue(capturedLabels.contains("Tweet"));
  }

  @Test
  void testComputeMetrics_VerifiesOrientationNatural() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<Map<String, Map<String, String>>> relationsCaptor =
        ArgumentCaptor.forClass(Map.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(anyString(), anyList(), relationsCaptor.capture());
    Map<String, Map<String, String>> relations = relationsCaptor.getValue();
    assertTrue(relations.containsKey("MENTIONS"));
    assertEquals("NATURAL", relations.get("MENTIONS").get("orientation"));
  }

  @Test
  void testComputeMetrics_VerifiesOrientationUndirected() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.UNDIRECTED));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<Map<String, Map<String, String>>> relationsCaptor =
        ArgumentCaptor.forClass(Map.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(anyString(), anyList(), relationsCaptor.capture());
    Map<String, Map<String, String>> relations = relationsCaptor.getValue();
    assertTrue(relations.containsKey("MENTIONS"));
    assertEquals("UNDIRECTED", relations.get("MENTIONS").get("orientation"));
  }

  @Test
  void testComputeMetrics_VerifiesMultipleRelationTypes() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS, RelationType.POSTED, RelationType.REPLY_TO),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<Map<String, Map<String, String>>> relationsCaptor =
        ArgumentCaptor.forClass(Map.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(anyString(), anyList(), relationsCaptor.capture());
    Map<String, Map<String, String>> relations = relationsCaptor.getValue();
    assertEquals(3, relations.size());
    assertTrue(relations.containsKey("MENTIONS"));
    assertTrue(relations.containsKey("POSTED"));
    assertTrue(relations.containsKey("REPLY_TO"));
  }

  @Test
  void testComputeMetrics_GraphDroppedEvenOnFailure() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);
    doThrow(new RuntimeException("Computation failed")).when(pageRankStrategy).compute(anyString());

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> metricComputationService.computeMetrics(projectName, config));
    verify(graphRepository).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_SpecialCharactersInProjectName() {
    // Arrange
    String projectName = "Test@Project#2024!";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<String> graphNameCaptor = ArgumentCaptor.forClass(String.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(graphNameCaptor.capture(), anyList(), anyMap());
    String capturedGraphName = graphNameCaptor.getValue();
    assertEquals("g_test_project_2024__pagerank", capturedGraphName);
  }

  @Test
  void testComputeMetrics_VerifiesRelationTypeMapping() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<Map<String, Map<String, String>>> relationsCaptor =
        ArgumentCaptor.forClass(Map.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(anyString(), anyList(), relationsCaptor.capture());
    Map<String, Map<String, String>> relations = relationsCaptor.getValue();
    Map<String, String> mentionsRelation = relations.get("MENTIONS");
    assertEquals("MENTIONS", mentionsRelation.get("type"));
    assertEquals("NATURAL", mentionsRelation.get("orientation"));
  }

  @Test
  void testComputeMetrics_StrategyNotFound() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.COMMUNITY,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class,
        () -> metricComputationService.computeMetrics(projectName, config));
    
    assertTrue(exception.getMessage().contains("Failed to compute metric"));
    verify(graphRepository).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_GraphCreationFails() {
    // Arrange
    String projectName = "TestProject";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    doThrow(new RuntimeException("Graph creation failed"))
        .when(graphRepository).createGraph(anyString(), anyList(), anyMap());

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class,
        () -> metricComputationService.computeMetrics(projectName, config));
    
    assertTrue(exception.getMessage().contains("Failed to compute metric"));
    verify(pageRankStrategy, never()).compute(anyString());
    verify(graphRepository).dropGdsGraph(anyString());
  }

  @Test
  void testComputeMetrics_WithSpecialCharactersInProjectName() {
    // Arrange
    String projectName = "Test Project-2024!@#";
    List<MetricConfig> metrics =
        List.of(
            new MetricConfig(
                MetricType.PAGERANK,
                Set.of(NodeType.AUTHOR),
                Set.of(RelationType.MENTIONS),
                Orientation.NATURAL));

    ProjectConfig config = new ProjectConfig(Instant.now(), metrics);
    List<MetricComputationStrategy> strategies = List.of(pageRankStrategy);

    when(pageRankStrategy.getMetricType()).thenReturn(MetricType.PAGERANK);

    metricComputationService =
        new MetricComputationService(graphRepository, strategies, algorithmRepository);

    ArgumentCaptor<String> graphNameCaptor = ArgumentCaptor.forClass(String.class);

    // Act
    metricComputationService.computeMetrics(projectName, config);

    // Assert
    verify(graphRepository).createGraph(graphNameCaptor.capture(), anyList(), anyMap());
    String capturedGraphName = graphNameCaptor.getValue();
    assertEquals("g_test_project_2024____pagerank", capturedGraphName);
  }

  @Test
  void testComputeShortestPath_Success() {
    // Arrange
    String graphName = "TestGraph";
    NodeDto source = new NodeDto();
    source.setId("1");
    NodeDto target = new NodeDto();
    target.setId("2");
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);

    List<NodeDto> pathResult = List.of(source, target);

    when(algorithmRepository.computeShortestPath(eq(graphName), eq("1"), eq("2")))
            .thenReturn(pathResult);

    // Act
    List<NodeDto> result = metricComputationService.computeShortestPath(
            graphName, AlgorithmType.SHORTEST_PATH, nodeTypes, relationTypes, Orientation.NATURAL, source, target);

    // Assert
    assertEquals(2, result.size());
    assertEquals(source, result.get(0));
    assertEquals(target, result.get(1));

    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(algorithmRepository).computeShortestPath(graphName, "1", "2");
    verify(graphRepository).dropGdsGraph(graphName);
  }

  @Test
  void testComputeShortestPath_Failure() {
    // Arrange
    String graphName = "TestGraph";
    NodeDto source = new NodeDto();
    source.setId("1");
    NodeDto target = new NodeDto();
    target.setId("2");
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);

    when(algorithmRepository.computeShortestPath(eq(graphName), eq("1"), eq("2")))
            .thenThrow(new RuntimeException("Algorithm failure"));

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class,
            () -> metricComputationService.computeShortestPath(
                    graphName, AlgorithmType.SHORTEST_PATH, nodeTypes, relationTypes, Orientation.NATURAL, source, target));

    assertTrue(exception.getMessage().contains("Failed to compute metric"));

    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(algorithmRepository).computeShortestPath(graphName, "1", "2");
    verify(graphRepository).dropGdsGraph(graphName);
  }

  @Test
  void testComputeFindBridges_Success() {
    // Arrange
    String graphName = "TestGraph";
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);
    List<LinkDto> bridges = List.of(new LinkDto("1", "2", RelationType.MENTIONS, 1));

    when(algorithmRepository.computeFindBridges(eq(graphName), eq(relationTypes)))
            .thenReturn(bridges);

    // Act
    List<LinkDto> result = metricComputationService.computeFindBridges(
            graphName, AlgorithmType.BRIDGES, nodeTypes, relationTypes, Orientation.NATURAL);

    // Assert
    assertEquals(1, result.size());
    assertEquals("1", result.get(0).source());
    assertEquals("2", result.get(0).target());
    assertEquals(RelationType.MENTIONS, result.get(0).relation());

    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(algorithmRepository).computeFindBridges(graphName, relationTypes);
    verify(graphRepository).dropGdsGraph(graphName);
  }

  @Test
  void testComputeFindBridges_Failure() {
    // Arrange
    String graphName = "TestGraph";
    Set<NodeType> nodeTypes = Set.of(NodeType.AUTHOR);
    Set<RelationType> relationTypes = Set.of(RelationType.MENTIONS);

    when(algorithmRepository.computeFindBridges(eq(graphName), eq(relationTypes)))
            .thenThrow(new RuntimeException("Algorithm failure"));

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class,
            () -> metricComputationService.computeFindBridges(
                    graphName, AlgorithmType.BRIDGES, nodeTypes, relationTypes, Orientation.NATURAL));

    assertTrue(exception.getMessage().contains("Failed to compute metric"));

    verify(graphRepository).createGraph(anyString(), anyList(), anyMap());
    verify(algorithmRepository).computeFindBridges(graphName, relationTypes);
    verify(graphRepository).dropGdsGraph(graphName);
  }
}

