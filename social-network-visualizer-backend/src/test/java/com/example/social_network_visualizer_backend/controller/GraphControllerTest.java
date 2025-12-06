package com.example.social_network_visualizer_backend.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.request.BridgesRequest;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
import com.example.social_network_visualizer_backend.dto.request.ShortestPathRequest;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GraphController.class)
class GraphControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private GraphService graphService;

  @Test
  void testGetGraph_Success() throws Exception {
    // Arrange
    GraphDataDto graphData = new GraphDataDto(List.of(), List.of());
    GraphQueryRequest queryRequest = new GraphQueryRequest(Set.of(), Set.of(), null, null);
    when(graphService.getGraph(any(GraphQueryRequest.class))).thenReturn(graphData);

    // Act & Assert
    mockMvc
        .perform(
            post("/graph")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(queryRequest)))
        .andExpect(status().isOk());

    verify(graphService, times(1)).getGraph(any(GraphQueryRequest.class));
  }

  @Test
  void testGetSearchSuggestions_Success() throws Exception {
    // Arrange
    String query = "test";
    NodeSearchDto suggestion = new NodeSearchDto();
    List<NodeSearchDto> suggestions = Arrays.asList(suggestion, suggestion, suggestion);
    when(graphService.getSuggestions(query)).thenReturn(suggestions);

    // Act & Assert
    mockMvc
        .perform(get("/graph/search").param("query", query).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(3));

    verify(graphService, times(1)).getSuggestions(query);
  }

  @Test
  void testGetSearchSuggestions_EmptyQuery() throws Exception {
    // Arrange
    String query = "";
    List<NodeSearchDto> suggestions = List.of();
    when(graphService.getSuggestions(query)).thenReturn(suggestions);

    // Act & Assert
    mockMvc
        .perform(get("/graph/search").param("query", query).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(graphService, times(1)).getSuggestions(query);
  }

  @Test
  void testGetSearchSuggestions_WithSpecialCharacters() throws Exception {
    // Arrange
    String query = "test@user";
    NodeSearchDto suggestion = new NodeSearchDto();
    List<NodeSearchDto> suggestions = List.of(suggestion);
    when(graphService.getSuggestions(query)).thenReturn(suggestions);

    // Act & Assert
    mockMvc
        .perform(get("/graph/search").param("query", query).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1));

    verify(graphService, times(1)).getSuggestions(query);
  }

  @Test
  void testGetGraphData_EmptyResult() throws Exception {
    // Arrange
    GraphQueryRequest queryRequest = new GraphQueryRequest(null, null, null, null);
    GraphDataDto emptyGraph = new GraphDataDto(Collections.emptyList(), Collections.emptyList());
    when(graphService.getGraph(any(GraphQueryRequest.class))).thenReturn(emptyGraph);

    // Act & Assert
    mockMvc
        .perform(
            post("/graph")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(queryRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nodes").isArray())
        .andExpect(jsonPath("$.nodes.length()").value(0))
        .andExpect(jsonPath("$.links").isArray())
        .andExpect(jsonPath("$.links.length()").value(0));

    verify(graphService, times(1)).getGraph(any(GraphQueryRequest.class));
  }

  @Test
  void testGetGraphData_ServiceThrowsException() throws Exception {
    // Arrange
    GraphQueryRequest queryRequest = new GraphQueryRequest(null, null, null, null);
    when(graphService.getGraph(any(GraphQueryRequest.class)))
        .thenThrow(new RuntimeException("Graph computation failed"));

    // Act & Assert
    mockMvc
        .perform(
            post("/graph")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(queryRequest)))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(graphService, times(1)).getGraph(any(GraphQueryRequest.class));
  }

  @Test
  void testGetGraphData_InvalidRequestBody() throws Exception {
    // Arrange
    String invalidJson = "{ invalid json }";

    // Act & Assert
    mockMvc
        .perform(post("/graph").contentType(MediaType.APPLICATION_JSON).content(invalidJson))
        .andExpect(status().isInternalServerError());
  }

  @Test
  void testGetSearchSuggestions_ServiceThrowsException() throws Exception {
    // Arrange
    String query = "test";
    when(graphService.getSuggestions(query))
        .thenThrow(new RuntimeException("Search service unavailable"));

    // Act & Assert
    mockMvc
        .perform(get("/graph/search").param("query", query).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(graphService, times(1)).getSuggestions(query);
  }

  @Test
  void testGetSearchSuggestions_NoResults() throws Exception {
    // Arrange
    String query = "nonexistentquery123456";
    when(graphService.getSuggestions(query)).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(get("/graph/search").param("query", query).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(graphService, times(1)).getSuggestions(query);
  }

  @Test
  void testGetShortestPath_Success() throws Exception {
    // Arrange
    AuthorNodeDto sourceNode = new AuthorNodeDto(null, null);
    sourceNode.setId("author1");
    sourceNode.setName("Author 1");
    sourceNode.setNodeType(NodeType.AUTHOR);

    AuthorNodeDto targetNode = new AuthorNodeDto(null, null);
    targetNode.setId("author2");
    targetNode.setName("Author 2");
    targetNode.setNodeType(NodeType.AUTHOR);

    ShortestPathRequest request =
        new ShortestPathRequest(
            sourceNode, targetNode, Set.of(NodeType.AUTHOR), Set.of(RelationType.POSTED));
    List<NodeDto> path = Arrays.asList(sourceNode, targetNode);
    when(graphService.getShortestPath(any(ShortestPathRequest.class))).thenReturn(path);

    // Act & Assert
    mockMvc
        .perform(
            post("/graph/shortest-path")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(graphService, times(1)).getShortestPath(any(ShortestPathRequest.class));
  }

  @Test
  void testGetShortestPath_NoPathFound() throws Exception {
    // Arrange
    AuthorNodeDto sourceNode = new AuthorNodeDto(null, null);
    sourceNode.setId("isolated1");
    sourceNode.setName("Isolated 1");
    sourceNode.setNodeType(NodeType.AUTHOR);

    AuthorNodeDto targetNode = new AuthorNodeDto(null, null);
    targetNode.setId("isolated2");
    targetNode.setName("Isolated 2");
    targetNode.setNodeType(NodeType.AUTHOR);

    ShortestPathRequest request =
        new ShortestPathRequest(
            sourceNode, targetNode, Set.of(NodeType.AUTHOR), Set.of(RelationType.POSTED));
    when(graphService.getShortestPath(any(ShortestPathRequest.class)))
        .thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(
            post("/graph/shortest-path")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(graphService, times(1)).getShortestPath(any(ShortestPathRequest.class));
  }

  @Test
  void testGetShortestPath_ServiceThrowsException() throws Exception {
    // Arrange
    AuthorNodeDto sourceNode = new AuthorNodeDto(null, null);
    sourceNode.setId("source");
    sourceNode.setName("Source");
    sourceNode.setNodeType(NodeType.AUTHOR);

    AuthorNodeDto targetNode = new AuthorNodeDto(null, null);
    targetNode.setId("target");
    targetNode.setName("Target");
    targetNode.setNodeType(NodeType.AUTHOR);

    ShortestPathRequest request =
        new ShortestPathRequest(
            sourceNode, targetNode, Set.of(NodeType.AUTHOR), Set.of(RelationType.POSTED));
    when(graphService.getShortestPath(any(ShortestPathRequest.class)))
        .thenThrow(new RuntimeException("Algorithm failed"));

    // Act & Assert
    mockMvc
        .perform(
            post("/graph/shortest-path")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(graphService, times(1)).getShortestPath(any(ShortestPathRequest.class));
  }

  @Test
  void testGetBridges_Success() throws Exception {
    // Arrange
    BridgesRequest request =
        new BridgesRequest(Set.of(NodeType.AUTHOR, NodeType.TWEET), Set.of(RelationType.POSTED));
    List<LinkDto> bridges =
        Arrays.asList(
            new LinkDto("author1", "tweet1", RelationType.POSTED, 1),
            new LinkDto("tweet1", "tweet2", RelationType.REPLY_TO, 1));
    when(graphService.getBridges(any(BridgesRequest.class))).thenReturn(bridges);

    // Act & Assert
    mockMvc
        .perform(
            post("/graph/bridges")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2));

    verify(graphService, times(1)).getBridges(any(BridgesRequest.class));
  }

  @Test
  void testGetBridges_NoBridgesFound() throws Exception {
    // Arrange
    BridgesRequest request =
        new BridgesRequest(Set.of(NodeType.AUTHOR), Set.of(RelationType.POSTED));
    when(graphService.getBridges(any(BridgesRequest.class))).thenReturn(Collections.emptyList());

    // Act & Assert
    mockMvc
        .perform(
            post("/graph/bridges")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(graphService, times(1)).getBridges(any(BridgesRequest.class));
  }

  @Test
  void testGetBridges_ServiceThrowsException() throws Exception {
    // Arrange
    BridgesRequest request =
        new BridgesRequest(Set.of(NodeType.AUTHOR), Set.of(RelationType.POSTED));
    when(graphService.getBridges(any(BridgesRequest.class)))
        .thenThrow(new RuntimeException("Bridge algorithm failed"));

    // Act & Assert
    mockMvc
        .perform(
            post("/graph/bridges")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").exists());

    verify(graphService, times(1)).getBridges(any(BridgesRequest.class));
  }
}
