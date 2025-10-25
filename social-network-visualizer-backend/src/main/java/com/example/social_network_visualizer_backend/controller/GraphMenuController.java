package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/menu")
public class GraphMenuController {
  private final GraphService graphService;
  private final GraphMenuService graphMenuService;

  @GetMapping("/author/{authorId}/latest-tweets")
  public ResponseEntity<GraphDataDto> addAuthorTop10Tweets(@PathVariable String authorId) {
    graphMenuService.addAuthorsLatestTweets(authorId, 10);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }
}
