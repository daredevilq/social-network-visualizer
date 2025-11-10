package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.service.GraphMenuService;
import com.example.social_network_visualizer_backend.service.GraphService;
import com.example.social_network_visualizer_backend.service.WorkspaceService;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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

  @PostMapping("/author/latest-tweets")
  public ResponseEntity<GraphDataDto> addAuthorsLatestTweets(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addAuthorsLatestTweets(authorNodeDtos, 10);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/popular-tweets")
  public ResponseEntity<GraphDataDto> addAuthorsMostPopularTweets(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addAuthorsMostPopularTweets(authorNodeDtos, 10);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/communities")
  public ResponseEntity<GraphDataDto> addAuthorsForCommunities(
      @RequestBody List<AuthorNodeDto> authorNodeDtos,
      @RequestParam(name = "nodeNumber", required = false) Integer nodeNumber) {
    graphMenuService.addAuthorsCommunities(authorNodeDtos, Optional.ofNullable(nodeNumber));
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/used-hashtags")
  public ResponseEntity<GraphDataDto> addHashtagsUsedByAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addHashtagsUsedByAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/mentioned-users")
  public ResponseEntity<GraphDataDto> addMentionedUsersByAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addMentionedUsersByAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/mentioning-authors")
  public ResponseEntity<GraphDataDto> addAuthorsMentioningTheseAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addAuthorsMentioningTheseAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/replied-to-authors")
  public ResponseEntity<GraphDataDto> addAuthorsMostRepliedToByAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addAuthorsMostRepliedToByAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/replying-authors")
  public ResponseEntity<GraphDataDto> addAuthorsMostReplyingToAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addAuthorsMostReplyingToAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/replied-tweets")
  public ResponseEntity<GraphDataDto> addTweetsRepliedToByAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addTweetsRepliedToByAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/author/mentioned-in-tweets")
  public ResponseEntity<GraphDataDto> addTweetsMentioningAuthors(
      @RequestBody List<AuthorNodeDto> authorNodeDtos) {
    graphMenuService.addTweetsMentioningAuthors(authorNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/membership")
  public ResponseEntity<GraphDataDto> updateWorkspaceMembership(
      @RequestBody List<NodeDto> nodeDtos, @RequestParam boolean add) {
    workspaceService.updateWorkspaceMembership(nodeDtos, add);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/authors")
  public ResponseEntity<GraphDataDto> addTweetAuthorsToWorkspace(
      @RequestBody List<TweetNodeDto> tweetNodeDtos) {
    graphMenuService.addTweetAuthorsToWorkspace(tweetNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/hashtags")
  public ResponseEntity<GraphDataDto> addTweetHashtagsToWorkspace(
      @RequestBody List<TweetNodeDto> tweetNodeDtos) {
    graphMenuService.addTweetHashtagsToWorkspace(tweetNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/mentioned-authors")
  public ResponseEntity<GraphDataDto> addMentionedAuthorsFromTweets(
      @RequestBody List<TweetNodeDto> tweetNodeDtos) {
    graphMenuService.addMentionedAuthorsFromTweets(tweetNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/parent-tweets")
  public ResponseEntity<GraphDataDto> addParentTweetsToWorkspace(
      @RequestBody List<TweetNodeDto> tweetNodeDtos) {
    graphMenuService.addParentTweetsToWorkspace(tweetNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/tweet/children-tweets")
  public ResponseEntity<GraphDataDto> addTweetChildrenToWorkspace(
      @RequestBody List<TweetNodeDto> tweetNodeDtos) {
    graphMenuService.addTweetChildrenToWorkspace(tweetNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/hashtag/highlight-authors")
  public ResponseEntity<GraphDataDto> addTopAuthorsForHashtags(
      @RequestBody List<HashtagNodeDto> hashtagNodeDtos) {
    graphMenuService.addTopAuthorsForHashtags(hashtagNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/hashtag/top-tweets")
  public ResponseEntity<GraphDataDto> addTopTweetsByHashtags(
      @RequestBody List<HashtagNodeDto> hashtagNodeDtos) {
    graphMenuService.addTopTweetsByHashtags(hashtagNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }

  @PostMapping("/hashtag/related-hashtags")
  public ResponseEntity<GraphDataDto> addRelatedHashtags(
      @RequestBody List<HashtagNodeDto> hashtagNodeDtos) {
    graphMenuService.addRelatedHashtags(hashtagNodeDtos);
    return ResponseEntity.ok(graphService.fetchWorkspaceData());
  }
}
