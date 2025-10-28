package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/graph/menu")
public class GraphMenuController {
  private final GraphService graphService;
  private final GraphMenuService graphMenuService;
  private final WorkspaceService workspaceService;

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

  @PostMapping("/membership")
  public ResponseEntity<GraphDataDto> updateWorkspaceMembership(
      @RequestBody NodeDto nodeDto, @RequestParam boolean add) {
    workspaceService.updateWorkspaceMembership(nodeDto, add);
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
