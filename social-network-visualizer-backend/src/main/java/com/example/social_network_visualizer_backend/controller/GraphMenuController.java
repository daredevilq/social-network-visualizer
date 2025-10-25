package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/graph/menu")
@RequiredArgsConstructor
public class GraphMenuController {
  private final GraphMenuService graphMenuService;
  private final GraphService graphService;

  @PostMapping
  public ResponseEntity<GraphDataDto> getTweetAuthor(@RequestBody TweetNodeDto tweetNodeDto) {
    graphMenuService.getTweetAuthor(tweetNodeDto);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }
}
