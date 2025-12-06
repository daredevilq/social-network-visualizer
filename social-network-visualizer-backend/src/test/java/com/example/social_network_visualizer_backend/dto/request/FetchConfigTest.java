package com.example.social_network_visualizer_backend.dto.request;

import static org.junit.jupiter.api.Assertions.*;

import com.example.social_network_visualizer_backend.enums.FetchStrategy;
import com.example.social_network_visualizer_backend.enums.NodeType;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class FetchConfigTest {

  @Test
  void testDefaultConfig_ReturnsAllStrategy() {
    // Arrange & Act
    FetchConfig config = FetchConfig.defaultConfig();

    // Assert
    assertNotNull(config);
    assertEquals(FetchStrategy.ALL, config.strategy());
    assertNotNull(config.nodeLimits());
    assertTrue(config.nodeLimits().isEmpty());
  }

  @Test
  void testWithLimits_CreatesConfigWithLimits() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 100);
    limits.put(NodeType.TWEET, 200);

    // Act
    FetchConfig config = FetchConfig.withLimits(limits);

    // Assert
    assertNotNull(config);
    assertEquals(FetchStrategy.LIMIT_PER_TYPE, config.strategy());
    assertEquals(limits, config.nodeLimits());
  }

  @Test
  void testGetLimitForNodeType_AllStrategy_ReturnsMaxValue() {
    // Arrange
    FetchConfig config = FetchConfig.defaultConfig();

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(Integer.MAX_VALUE, limit);
  }

  @Test
  void testGetLimitForNodeType_LimitPerTypeStrategy_WithValidLimit() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 100);
    limits.put(NodeType.TWEET, 200);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer authorLimit = config.getLimitForNodeType(NodeType.AUTHOR);
    Integer tweetLimit = config.getLimitForNodeType(NodeType.TWEET);

    // Assert
    assertEquals(100, authorLimit);
    assertEquals(200, tweetLimit);
  }

  @Test
  void testGetLimitForNodeType_LimitPerTypeStrategy_NodeTypeNotInMap() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 100);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer hashtagLimit = config.getLimitForNodeType(NodeType.HASHTAG);

    // Assert
    assertEquals(Integer.MAX_VALUE, hashtagLimit);
  }

  @Test
  void testGetLimitForNodeType_LimitPerTypeStrategy_ZeroLimit() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 0);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(Integer.MAX_VALUE, limit);
  }

  @Test
  void testGetLimitForNodeType_LimitPerTypeStrategy_NegativeLimit() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, -10);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(Integer.MAX_VALUE, limit);
  }

  @Test
  void testGetLimitForNodeType_LimitPerTypeStrategy_NullInMap() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, null);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(Integer.MAX_VALUE, limit);
  }

  @Test
  void testGetLimitForNodeType_AllNodeTypes() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 50);
    limits.put(NodeType.TWEET, 100);
    limits.put(NodeType.HASHTAG, 75);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act & Assert
    assertEquals(50, config.getLimitForNodeType(NodeType.AUTHOR));
    assertEquals(100, config.getLimitForNodeType(NodeType.TWEET));
    assertEquals(75, config.getLimitForNodeType(NodeType.HASHTAG));
  }

  @Test
  void testGetLimitForNodeType_EmptyLimitsMap() {
    // Arrange
    FetchConfig config = FetchConfig.withLimits(new HashMap<>());

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(Integer.MAX_VALUE, limit);
  }

  @Test
  void testGetLimitForNodeType_BoundaryValue_MaxInteger() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, Integer.MAX_VALUE);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(Integer.MAX_VALUE, limit);
  }

  @Test
  void testGetLimitForNodeType_BoundaryValue_One() {
    // Arrange
    Map<NodeType, Integer> limits = new HashMap<>();
    limits.put(NodeType.AUTHOR, 1);
    FetchConfig config = FetchConfig.withLimits(limits);

    // Act
    Integer limit = config.getLimitForNodeType(NodeType.AUTHOR);

    // Assert
    assertEquals(1, limit);
  }
}
