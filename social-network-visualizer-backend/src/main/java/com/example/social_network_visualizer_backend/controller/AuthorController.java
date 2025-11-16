package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.author.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.author.TweetPreviewDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.service.AuthorService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/author")
@RequiredArgsConstructor
public class AuthorController {
  private final AuthorService authorService;

  @GetMapping("/all/{authorName}")
  public ResponseEntity<List<Tweet>> getAuthor(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findLast10TweetsByAuthor(authorName));
  }

  @GetMapping("/{authorName}")
  public ResponseEntity<AuthorDataResponse> findAuthorById(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findAuthorById(authorName));
  }

  @GetMapping("/activity/{authorName}")
  public ResponseEntity<Map<String, Long>> getAuthorActivity(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.getAuthorActivity(authorName));
  }

  @GetMapping("/shortestPath/{source}")
  public ResponseEntity<List<String>> findShortestPathBetweenAuthors(
      @PathVariable String source, @RequestParam String target) {
    return ResponseEntity.ok(authorService.findShortestPathBetweenAuthors(source, target));
  }

  @GetMapping("/last-posts/{authorName}")
  public ResponseEntity<List<TweetPreviewDto>> getLast3TweetUrls(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findLast3TweetUrlsByAuthor(authorName));
  }

  @GetMapping("/hashtags/{authorName}")
  public ResponseEntity<List<HashtagFrequency>> getTopHashtags(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findTopHashtagsByAuthor(authorName));
  }

  @GetMapping("/mentions/{authorName}")
  public ResponseEntity<List<String>> getMentionedAuthors(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findMentionsAuthorsByAuthor(authorName));
  }

  @GetMapping("/most-common-words/{authorName}")
  public ResponseEntity<Map<String, Long>> getTweetsContent(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findMostCommonWords(authorName));
  }

  @GetMapping("/retweets-by/{authorName}")
  public ResponseEntity<List<String>> getAuthorRetweets(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findAuthorRetweets(authorName));
  }

  @GetMapping("/retweets-of/{authorName}")
  public ResponseEntity<List<String>> getRetweetsByAuthors(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findRetweetsByAuthor(authorName));
  }

  @GetMapping("/viral-tweets/{authorName}")
  public ResponseEntity<List<ViralTweetDto>> getViralTweets(@PathVariable String authorName) {
    return ResponseEntity.ok(authorService.findTheMostViralTweet(authorName));
  }

  @GetMapping("/heatmap/{authorName}")
  public ResponseEntity<List<ActivityHeatmap>> getAuthorActivityHeatmap(
      @PathVariable String authorName) {
    return ResponseEntity.ok(authorService.getAuthorActivityHeatmap(authorName));
  }
}
