package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.request.BridgesRequest;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
import com.example.social_network_visualizer_backend.dto.request.ShortestPathRequest;
import com.example.social_network_visualizer_backend.service.GraphService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/graph")
@RequiredArgsConstructor
public class GraphController {
  private final GraphService graphService;

  @PostMapping
  public ResponseEntity<GraphDataDto> getGraph(@RequestBody GraphQueryRequest request) {
    GraphDataDto graph = graphService.getGraph(request, Optional.empty());
    return ResponseEntity.ok(graph);
  }

  @PostMapping("/community/{communityId}")
  public ResponseEntity<GraphDataDto> getGraphByCommunity(
      @PathVariable Integer communityId, @RequestBody GraphQueryRequest request) {
    GraphDataDto graph = graphService.getGraph(request, Optional.of(communityId));
    return ResponseEntity.ok(graph);
  }

  @GetMapping("/search")
  public ResponseEntity<List<NodeSearchDto>> getSearchSuggestions(@RequestParam String query) {
    return ResponseEntity.ok(graphService.getSuggestions(query));
  }

  @PostMapping("/shortest-path")
  public ResponseEntity<List<NodeDto>> getShortestPath(@RequestBody ShortestPathRequest request) {
    return ResponseEntity.ok(graphService.getShortestPath(request));
  }

  @PostMapping("/bridges")  
  public ResponseEntity<List<LinkDto>> getBridges(@RequestBody BridgesRequest request) {
    return ResponseEntity.ok(graphService.getBridges(request));
  }
}
