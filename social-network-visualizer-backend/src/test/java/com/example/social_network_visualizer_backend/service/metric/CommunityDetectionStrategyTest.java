package com.example.social_network_visualizer_backend.service.metric;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.repository.AlgorithmRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CommunityDetectionStrategyTest {

  @Mock private AlgorithmRepository algorithmRepository;

  @InjectMocks private CommunityDetectionStrategy strategy;

  @Test
  void testGetMetricType() {
    // Act
    MetricType result = strategy.getMetricType();

    // Assert
    assertEquals(MetricType.COMMUNITY, result);
  }

  @Test
  void testCompute_Success() {
    // Arrange
    String graphName = "test_graph";

    // Act
    strategy.compute(graphName);

    // Assert
    verify(algorithmRepository).createCommunities(graphName);
  }

  @Test
  void testCompute_DifferentGraphNames() {
    // Arrange
    String graphName1 = "graph_1";
    String graphName2 = "graph_2";

    // Act
    strategy.compute(graphName1);
    strategy.compute(graphName2);

    // Assert
    verify(algorithmRepository).createCommunities(graphName1);
    verify(algorithmRepository).createCommunities(graphName2);
    verify(algorithmRepository, times(2)).createCommunities(anyString());
  }

  @Test
  void testCompute_WithSpecialCharacters() {
    // Arrange
    String graphName = "test-graph_123";

    // Act
    strategy.compute(graphName);

    // Assert
    verify(algorithmRepository).createCommunities(graphName);
  }
}
