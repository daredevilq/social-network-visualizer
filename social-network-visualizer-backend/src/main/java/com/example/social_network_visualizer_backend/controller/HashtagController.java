package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagProfileDto;
import com.example.social_network_visualizer_backend.service.HashtagService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hashtag")
@RequiredArgsConstructor
public class HashtagController {
  private final HashtagService hashtagService;

  @GetMapping("/{hashtagName}/sidebarDetails")
  public ResponseEntity<HashtagDetailsDto> getHashtagDetails(@PathVariable String hashtagName) {
    return ResponseEntity.ok(hashtagService.getHashtagDetails(hashtagName, 5, 3));
  }

  @GetMapping("/{hashtagName}/profile")
  public ResponseEntity<HashtagProfileDto> getHashtagProfile(@PathVariable String hashtagName) {
    return ResponseEntity.ok(hashtagService.getHashtagProfile(hashtagName));
  }

  @GetMapping("/{hashtagName}/top-tweets-and-authors")
  public ResponseEntity<HashtagDetailsDto> getHashtagTopAuthorsAndTweets(
      @PathVariable String hashtagName) {
    return ResponseEntity.ok(hashtagService.getHashtagDetails(hashtagName, 10, 10));
  }

  @GetMapping("/{hashtagName}/activity")
  public ResponseEntity<Map<String, Long>> getHashtagActivity(@PathVariable String hashtagName) {
    return ResponseEntity.ok(hashtagService.getHashtagActivity(hashtagName));
  }

  @GetMapping("/{hashtagName}/most-common-words")
  public ResponseEntity<Map<String, Long>> getHashtagMostCommonWords(
      @PathVariable String hashtagName) {
    Map<String, Long> hashtagMostCommonWords = hashtagService.findMostCommonWords(hashtagName);
    return ResponseEntity.ok(hashtagMostCommonWords);
  }
}
