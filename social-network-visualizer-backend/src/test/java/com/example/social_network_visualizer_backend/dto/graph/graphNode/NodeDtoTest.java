package com.example.social_network_visualizer_backend.dto.graph.graphNode;

import static org.junit.jupiter.api.Assertions.*;

import com.example.social_network_visualizer_backend.enums.NodeType;
import java.util.Map;
import org.junit.jupiter.api.Test;

class NodeDtoTest {

  @Test
  void testConvertToMap_WithValidData() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("author123");
    nodeDto.setName("name");
    nodeDto.setNodeType(NodeType.AUTHOR);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals("author123", result.get("id"));
    assertEquals("name", result.get("name"));
    assertEquals("AUTHOR", result.get("nodeType"));
  }

  @Test
  void testConvertToMap_WithTweetNodeType() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("tweet456");
    nodeDto.setNodeType(NodeType.TWEET);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("tweet456", result.get("id"));
    assertEquals("TWEET", result.get("nodeType"));
  }

  @Test
  void testConvertToMap_WithHashtagNodeType() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("hashtag789");
    nodeDto.setNodeType(NodeType.HASHTAG);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("hashtag789", result.get("id"));
    assertEquals("HASHTAG", result.get("nodeType"));
  }

  @Test
  void testConvertToMap_WithNullId() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId(null);
    nodeDto.setNodeType(NodeType.AUTHOR);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertNull(result.get("id"));
    assertEquals("AUTHOR", result.get("nodeType"));
  }

  @Test
  void testConvertToMap_WithEmptyId() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("");
    nodeDto.setNodeType(NodeType.AUTHOR);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("", result.get("id"));
    assertEquals("AUTHOR", result.get("nodeType"));
  }

  @Test
  void testConvertToMap_WithSpecialCharactersInId() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("author@123!#$");
    nodeDto.setNodeType(NodeType.AUTHOR);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("author@123!#$", result.get("id"));
    assertEquals("AUTHOR", result.get("nodeType"));
  }

  @Test
  void testConvertToMap_MapIsNotEmpty() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("test");
    nodeDto.setNodeType(NodeType.AUTHOR);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertFalse(result.isEmpty());
  }

  @Test
  void testConvertToMap_MapContainsExpectedKeys() {
    // Arrange
    NodeDto nodeDto = new NodeDto();
    nodeDto.setId("test");
    nodeDto.setNodeType(NodeType.AUTHOR);

    // Act
    Map<String, String> result = nodeDto.convertToMap();

    // Assert
    assertTrue(result.containsKey("id"));
    assertTrue(result.containsKey("nodeType"));
  }

  @Test
  void testGettersAndSetters() {
    // Arrange
    NodeDto nodeDto = new NodeDto();

    // Act
    nodeDto.setId("testId");
    nodeDto.setNodeType(NodeType.TWEET);

    // Assert
    assertEquals("testId", nodeDto.getId());
    assertEquals(NodeType.TWEET, nodeDto.getNodeType());
  }

  @Test
  void testAuthorNodeDto_InheritsConvertToMap() {
    // Arrange
    AuthorNodeDto authorNode = new AuthorNodeDto();
    authorNode.setId("author123");
    authorNode.setNodeType(NodeType.AUTHOR);
    authorNode.setPagerank(0.85);
    authorNode.setCommunity(1);

    // Act
    Map<String, String> result = authorNode.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("author123", result.get("id"));
    assertEquals("AUTHOR", result.get("nodeType"));
  }
}

