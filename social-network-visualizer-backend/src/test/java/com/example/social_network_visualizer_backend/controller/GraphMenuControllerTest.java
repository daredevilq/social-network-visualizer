package com.example.social_network_visualizer_backend.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GraphMenuController.class)
class GraphMenuControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private GraphService graphService;
  @MockitoBean private GraphMenuService graphMenuService;
  @MockitoBean private WorkspaceService workspaceService;

  private GraphDataDto testGraphData;
  private List<AuthorNodeDto> authorNodes;
  private List<TweetNodeDto> tweetNodes;
  private List<HashtagNodeDto> hashtagNodes;
  private List<NodeDto> mixedNodes;

  @BeforeEach
  void setUp() {
    AuthorNodeDto author = new AuthorNodeDto(null, null);
    author.setId("author1");
    author.setNodeType(NodeType.AUTHOR);
    authorNodes = List.of(author);

    TweetNodeDto tweet = new TweetNodeDto(null, null, null, null, null, null, null, null, null);
    tweet.setId("tweet1");
    tweet.setNodeType(NodeType.TWEET);
    tweetNodes = List.of(tweet);

    HashtagNodeDto hashtag = new HashtagNodeDto();
    hashtag.setId("hashtag1");
    hashtag.setNodeType(NodeType.HASHTAG);
    hashtagNodes = List.of(hashtag);

    mixedNodes = new ArrayList<>(List.of(author, tweet, hashtag));

    testGraphData = new GraphDataDto(
        new ArrayList<>(List.of(author, tweet)),
        new ArrayList<>(List.of(new LinkDto("author1", "tweet1", RelationType.POSTED, 1)))
    );
  }

  @Test
  void testAddAuthorsLatestTweets_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/latest-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray())
        .andExpect(jsonPath("$.links").isArray());

    verify(graphMenuService).addAuthorsLatestTweets(anyList(), eq(10));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsMostPopularTweets_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/popular-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray())
        .andExpect(jsonPath("$.links").isArray());

    verify(graphMenuService).addAuthorsMostPopularTweets(anyList(), eq(10));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsForCommunities_WithNodeNumber() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/communities")
            .param("nodeNumber", "5")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addAuthorsCommunities(anyList(), eq(Optional.of(5)));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsForCommunities_WithoutNodeNumber() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/communities")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addAuthorsCommunities(anyList(), eq(Optional.empty()));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddHashtagsUsedByAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/used-hashtags")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addHashtagsUsedByAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddCommonHashtagsUsedByAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/common-hashtags")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addCommonHashtagUsedByAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddMentionedUsersByAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/mentioned-users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addMentionedUsersByAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsMentioningTheseAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/mentioning-authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addAuthorsMentioningTheseAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsMostRepliedToByAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/replied-to-authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addAuthorsMostRepliedToByAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsMostReplyingToAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/replying-authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addAuthorsMostReplyingToAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetsRepliedToByAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/replied-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTweetsRepliedToByAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetsMentioningAuthors_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/mentioned-in-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTweetsMentioningAuthors(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testUpdateWorkspaceMembership_Add() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/membership")
            .param("add", "true")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(mixedNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(workspaceService).updateWorkspaceMembership(anyList(), eq(true));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testUpdateWorkspaceMembership_Remove() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/membership")
            .param("add", "false")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(mixedNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(workspaceService).updateWorkspaceMembership(anyList(), eq(false));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetAuthorsToWorkspace_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tweetNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTweetAuthorsToWorkspace(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetHashtagsToWorkspace_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/hashtags")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tweetNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTweetHashtagsToWorkspace(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetsCommonHashtagsToWorkspace_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/common-hashtags")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tweetNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTweetsCommonHashtagsToWorkspace(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddMentionedAuthorsFromTweets_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/mentioned-authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tweetNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addMentionedAuthorsFromTweets(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddParentTweetsToWorkspace_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/parent-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tweetNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addParentTweetsToWorkspace(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetChildrenToWorkspace_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/children-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(tweetNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTweetChildrenToWorkspace(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTopAuthorsForHashtags_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/hashtag/highlight-authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(hashtagNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTopAuthorsForHashtags(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTopTweetsByHashtags_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/hashtag/top-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(hashtagNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addTopTweetsByHashtags(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddRelatedHashtags_Success() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/hashtag/related-hashtags")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(hashtagNodes)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray());

    verify(graphMenuService).addRelatedHashtags(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddAuthorsLatestTweets_EmptyList() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/latest-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(List.of())))
        .andExpect(status().isOk());

    verify(graphMenuService).addAuthorsLatestTweets(anyList(), eq(10));
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTweetAuthorsToWorkspace_EmptyList() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/tweet/authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(List.of())))
        .andExpect(status().isOk());

    verify(graphMenuService).addTweetAuthorsToWorkspace(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testAddTopAuthorsForHashtags_EmptyList() throws Exception {
    // Arrange
    when(graphService.fetchWorkspaceData()).thenReturn(testGraphData);

    // Act & Assert
    mockMvc.perform(post("/graph/menu/hashtag/highlight-authors")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(List.of())))
        .andExpect(status().isOk());

    verify(graphMenuService).addTopAuthorsForHashtags(anyList());
    verify(graphService).fetchWorkspaceData();
  }

  @Test
  void testUpdateWorkspaceMembership_InvalidRequest() throws Exception {
    // Act & Assert
    mockMvc.perform(post("/graph/menu/membership")
            .param("add", "true")
            .contentType(MediaType.APPLICATION_JSON)
            .content("invalid json"))
        .andExpect(status().isInternalServerError());

    verify(workspaceService, never()).updateWorkspaceMembership(anyList(), anyBoolean());
  }

  @Test
  void testAddAuthorsLatestTweets_ServiceThrowsException() throws Exception {
    // Arrange
    doThrow(new RuntimeException("Service error")).when(graphMenuService)
        .addAuthorsLatestTweets(anyList(), anyInt());

    // Act & Assert
    mockMvc.perform(post("/graph/menu/author/latest-tweets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(authorNodes)))
        .andExpect(status().isInternalServerError());

    verify(graphMenuService).addAuthorsLatestTweets(anyList(), eq(10));
    verify(graphService, never()).fetchWorkspaceData();
  }
}

