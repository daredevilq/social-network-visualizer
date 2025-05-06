package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.PaginatedTweetsDto;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.service.TweetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tweet")
@RequiredArgsConstructor
public class TweetController {
    private final TweetService tweetService;

    @GetMapping("/all/{userName}")
    public ResponseEntity<PaginatedTweetsDto> getTenTweetsByAuthor(
            @PathVariable String userName,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit) {

        return ResponseEntity.ok(tweetService.getRecentTweets(userName, page, limit));
    }
}