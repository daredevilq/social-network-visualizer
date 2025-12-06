package com.example.social_network_visualizer_backend.service.graph;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthorNodeQueryStrategyTest {

  @Mock private AuthorRepository authorRepository;

  @InjectMocks private AuthorNodeQueryStrategy strategy;

  @Test
  void testGetNodeType() {
    // Act
    NodeType result = strategy.getNodeType();

    // Assert
    assertEquals(NodeType.AUTHOR, result);
  }

  @Test
  void testFetchNodes_WithCommunityId() {
    // Arrange
    Integer communityId = 5;
    AuthorNodeDto author1 = new AuthorNodeDto(null, null);
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto(null, null);
    author2.setId("author2");
    List<AuthorNodeDto> expectedAuthors = List.of(author1, author2);

    when(authorRepository.findAuthorsWithCommunity(communityId)).thenReturn(expectedAuthors);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.of(communityId), false, 10);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("author1", result.get(0).getId());
    assertEquals("author2", result.get(1).getId());
    verify(authorRepository).findAuthorsWithCommunity(communityId);
    verify(authorRepository, never()).findAuthors(anyBoolean(), anyInt());
  }

  @Test
  void testFetchNodes_WithoutCommunityId_InWorkspace() {
    // Arrange
    AuthorNodeDto author1 = new AuthorNodeDto(null, null);
    author1.setId("author1");
    List<AuthorNodeDto> expectedAuthors = List.of(author1);

    when(authorRepository.findAuthors(true, 20)).thenReturn(expectedAuthors);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), true, 20);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("author1", result.get(0).getId());
    verify(authorRepository).findAuthors(true, 20);
    verify(authorRepository, never()).findAuthorsWithCommunity(anyInt());
  }

  @Test
  void testFetchNodes_WithoutCommunityId_NotInWorkspace() {
    // Arrange
    AuthorNodeDto author1 = new AuthorNodeDto(null, null);
    author1.setId("author1");
    AuthorNodeDto author2 = new AuthorNodeDto(null, null);
    author2.setId("author2");
    List<AuthorNodeDto> expectedAuthors = List.of(author1, author2);

    when(authorRepository.findAuthors(false, 50)).thenReturn(expectedAuthors);

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), false, 50);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    verify(authorRepository).findAuthors(false, 50);
    verify(authorRepository, never()).findAuthorsWithCommunity(anyInt());
  }

  @Test
  void testFetchNodes_EmptyResult() {
    // Arrange
    when(authorRepository.findAuthors(false, 10)).thenReturn(List.of());

    // Act
    List<? extends NodeDto> result = strategy.fetchNodes(Optional.empty(), false, 10);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(authorRepository).findAuthors(false, 10);
  }
}

