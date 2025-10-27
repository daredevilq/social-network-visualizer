package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/graph/menu")
public class GraphMenuController {
  private final GraphService graphService;
  private final GraphMenuService graphMenuService;
  private final WorkspaceService workspaceService;

  @PostMapping("/node/remove")
  public ResponseEntity<GraphDataDto> removeNodeFromWorkspace(@RequestBody NodeDto nodeDto) {
    workspaceService.updateWorkspaceMembership(nodeDto, false);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/{authorId}/latest-tweets")
  public ResponseEntity<GraphDataDto> addAuthorTop10Tweets(@PathVariable String authorId) {
    graphMenuService.addAuthorsLatestTweets(authorId, 10);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/community")
  public ResponseEntity<GraphDataDto> addAuthorCommunity(@RequestBody Map<String, Integer> body) {
    Integer communityId = body.get("communityId");
    Integer numberOfAuthors = body.getOrDefault("numberOfAuthorsToAdd", 10);
    graphMenuService.addAuthorsCommunity(communityId, numberOfAuthors);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }
}
