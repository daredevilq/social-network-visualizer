package com.example.social_network_visualizer_backend.dto.graph;

import static org.junit.jupiter.api.Assertions.*;

import com.example.social_network_visualizer_backend.enums.RelationType;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LinkDtoTest {

  @Test
  void testConvertToMap_WithValidData() {
    // Arrange
    LinkDto linkDto = new LinkDto("author1", "author2", RelationType.MENTIONS, 5);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals("author1", result.get("source"));
    assertEquals("author2", result.get("target"));
    assertEquals("MENTIONS", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithRetweetRelation() {
    // Arrange
    LinkDto linkDto = new LinkDto("user1", "user2", RelationType.RETWEETS, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("user1", result.get("source"));
    assertEquals("user2", result.get("target"));
    assertEquals("RETWEETS", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithReplyToRelation() {
    // Arrange
    LinkDto linkDto = new LinkDto("tweet1", "tweet2", RelationType.REPLY_TO, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("tweet1", result.get("source"));
    assertEquals("tweet2", result.get("target"));
    assertEquals("REPLY_TO", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithQuotedRelation() {
    // Arrange
    LinkDto linkDto = new LinkDto("tweet1", "tweet2", RelationType.QUOTED, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("tweet1", result.get("source"));
    assertEquals("tweet2", result.get("target"));
    assertEquals("QUOTED", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithPostedRelation() {
    // Arrange
    LinkDto linkDto = new LinkDto("author1", "tweet1", RelationType.POSTED, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("author1", result.get("source"));
    assertEquals("tweet1", result.get("target"));
    assertEquals("POSTED", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithUsesHashtagRelation() {
    // Arrange
    LinkDto linkDto = new LinkDto("tweet1", "hashtag1", RelationType.USES_HASHTAG, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("tweet1", result.get("source"));
    assertEquals("hashtag1", result.get("target"));
    assertEquals("USES_HASHTAG", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithNullSource() {
    // Arrange
    LinkDto linkDto = new LinkDto(null, "target", RelationType.MENTIONS, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertNull(result.get("source"));
    assertEquals("target", result.get("target"));
  }

  @Test
  void testConvertToMap_WithNullTarget() {
    // Arrange
    LinkDto linkDto = new LinkDto("source", null, RelationType.MENTIONS, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("source", result.get("source"));
    assertNull(result.get("target"));
  }

  @Test
  void testConvertToMap_WithEmptyStrings() {
    // Arrange
    LinkDto linkDto = new LinkDto("", "", RelationType.MENTIONS, 0);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("", result.get("source"));
    assertEquals("", result.get("target"));
    assertEquals("MENTIONS", result.get("relation"));
  }

  @Test
  void testConvertToMap_WithSpecialCharacters() {
    // Arrange
    LinkDto linkDto = new LinkDto("user@123", "user#456", RelationType.MENTIONS, 10);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertNotNull(result);
    assertEquals("user@123", result.get("source"));
    assertEquals("user#456", result.get("target"));
  }

  @Test
  void testConvertToMap_MapContainsExpectedKeys() {
    // Arrange
    LinkDto linkDto = new LinkDto("source", "target", RelationType.MENTIONS, 1);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertTrue(result.containsKey("source"));
    assertTrue(result.containsKey("target"));
    assertTrue(result.containsKey("relation"));
  }

  @Test
  void testConvertToMap_MapDoesNotContainWeight() {
    // Arrange
    LinkDto linkDto = new LinkDto("source", "target", RelationType.MENTIONS, 100);

    // Act
    Map<String, String> result = linkDto.convertToMap();

    // Assert
    assertFalse(result.containsKey("weight"));
  }

  @Test
  void testRecordAccessors() {
    // Arrange
    LinkDto linkDto = new LinkDto("source", "target", RelationType.MENTIONS, 5);

    // Act & Assert
    assertEquals("source", linkDto.source());
    assertEquals("target", linkDto.target());
    assertEquals(RelationType.MENTIONS, linkDto.relation());
    assertEquals(5, linkDto.weight());
  }

  @Test
  void testRecordEquality() {
    // Arrange
    LinkDto linkDto1 = new LinkDto("source", "target", RelationType.MENTIONS, 5);
    LinkDto linkDto2 = new LinkDto("source", "target", RelationType.MENTIONS, 5);

    // Act & Assert
    assertEquals(linkDto1, linkDto2);
    assertEquals(linkDto1.hashCode(), linkDto2.hashCode());
  }

  @Test
  void testRecordInequality_DifferentSource() {
    // Arrange
    LinkDto linkDto1 = new LinkDto("source1", "target", RelationType.MENTIONS, 5);
    LinkDto linkDto2 = new LinkDto("source2", "target", RelationType.MENTIONS, 5);

    // Act & Assert
    assertNotEquals(linkDto1, linkDto2);
  }

  @Test
  void testRecordInequality_DifferentRelation() {
    // Arrange
    LinkDto linkDto1 = new LinkDto("source", "target", RelationType.MENTIONS, 5);
    LinkDto linkDto2 = new LinkDto("source", "target", RelationType.RETWEETS, 5);

    // Act & Assert
    assertNotEquals(linkDto1, linkDto2);
  }
}

