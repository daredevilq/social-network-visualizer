package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
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
  private final WorkspaceService workspaceService;
  private final GraphService graphService;

  @PostMapping("/remove")
  public ResponseEntity<GraphDataDto> removeNodeFromWorkspace(@RequestBody NodeDto nodeDto) {
    workspaceService.updateWorkspaceMembership(nodeDto, false);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/author")
  public ResponseEntity<GraphDataDto> addTweetAuthorToWorkspace(
      @RequestBody TweetNodeDto tweetNodeDto) {
    graphMenuService.addTweetAuthorToWorkspace(tweetNodeDto);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/hashtags")
  public ResponseEntity<GraphDataDto> addTweetHashtagsToWorkspace(
      @RequestBody TweetNodeDto tweetNodeDto) {
    graphMenuService.addTweetHashtagsToWorkspace(tweetNodeDto);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/mentioned-authors")
  public ResponseEntity<GraphDataDto> addMentionedAuthorsToWorkspace(
      @RequestBody TweetNodeDto tweetNodeDto) {
    graphMenuService.addMentionedAuthorsToWorkspace(tweetNodeDto);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/hashtag/highlight-authors")
  public ResponseEntity<GraphDataDto> highlightUsersForHashtag(
      @RequestBody HashtagNodeDto hashtagNodeDto) {
    graphMenuService.addTopAuthorsForHashtag(hashtagNodeDto);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("hashtag/top-tweets")
  public ResponseEntity<GraphDataDto> addTopTweetsByHashtag(
      @RequestBody HashtagNodeDto hashtagNodeDto) {
    graphMenuService.addTopTweetsByHashtag(hashtagNodeDto);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }
}
