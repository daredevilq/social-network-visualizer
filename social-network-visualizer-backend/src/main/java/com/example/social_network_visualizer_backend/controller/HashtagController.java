package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.service.HashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hashtag")
@RequiredArgsConstructor
public class HashtagController {
  private final HashtagService hashtagService;

  @GetMapping("/{hashtagName}")
  public ResponseEntity<HashtagDetailsDto> getHashtagDetails(@PathVariable() String hashtagName) {

    return ResponseEntity.ok(hashtagService.getHashtagDetails(hashtagName));
  }
}
