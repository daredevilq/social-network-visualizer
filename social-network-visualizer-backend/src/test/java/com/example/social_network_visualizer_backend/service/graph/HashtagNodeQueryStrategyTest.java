package com.example.social_network_visualizer_backend.service.graph;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class HashtagNodeQueryStrategyTest {

  @Mock private HashtagRepository hashtagRepository;

  @InjectMocks private HashtagNodeQueryStrategy strategy;

  @Test
  void testGetNodeType() {
    // Act
    NodeType result = strategy.getNodeType();

    // Assert
    assertEquals(NodeType.HASHTAG, result);
  }

  @Test
  void testFetchNodes_InWorkspace() {
    // Arrange
    HashtagNodeDto hashtag1 = new HashtagNodeDto();
    hashtag1.setId("hashtag1");
    hashtag1.setName("covid19");
    HashtagNodeDto hashtag2 = new HashtagNodeDto();
    hashtag2.setId("hashtag2");
    hashtag2.setName("vaccine");
    List<HashtagNodeDto> expectedHashtags = List.of(hashtag1, hashtag2);

    when(hashtagRepository.findHashtag(true, 20)).thenReturn(expectedHashtags);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), true, 20);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("hashtag1", result.get(0).getId());
    assertEquals("hashtag2", result.get(1).getId());
    verify(hashtagRepository).findHashtag(true, 20);
  }

  @Test
  void testFetchNodes_NotInWorkspace() {
    // Arrange
    HashtagNodeDto hashtag1 = new HashtagNodeDto();
    hashtag1.setId("hashtag1");
    hashtag1.setName("covid19");
    List<HashtagNodeDto> expectedHashtags = List.of(hashtag1);

    when(hashtagRepository.findHashtag(false, 50)).thenReturn(expectedHashtags);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), false, 50);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("hashtag1", result.get(0).getId());
    verify(hashtagRepository).findHashtag(false, 50);
  }

  @Test
  void testFetchNodes_WithCommunityId_IgnoresCommunityId() {
    // Arrange - Hashtag strategy ignores communityId
    HashtagNodeDto hashtag1 = new HashtagNodeDto();
    hashtag1.setId("hashtag1");
    List<HashtagNodeDto> expectedHashtags = List.of(hashtag1);

    when(hashtagRepository.findHashtag(false, 10)).thenReturn(expectedHashtags);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.of(5), false, 10);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    verify(hashtagRepository).findHashtag(false, 10);
  }

  @Test
  void testFetchNodes_EmptyResult() {
    // Arrange
    when(hashtagRepository.findHashtag(false, 10)).thenReturn(List.of());

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), false, 10);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(hashtagRepository).findHashtag(false, 10);
  }
}
