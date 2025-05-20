package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.PaginatedTweetsDto;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.service.TweetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/tweet")
@RequiredArgsConstructor
public class TweetController {
    private final TweetService tweetService;

    @GetMapping("/list/all")
    public ResponseEntity<PaginatedTweetsDto> getTenTweetsByAuthor(
            @RequestParam(required = false) String userName,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) List<String> hashtags,
            @RequestParam(defaultValue = "false") Boolean highEngagement) {

        if (hashtags == null) {
            hashtags = new ArrayList<>();
        }
        return ResponseEntity.ok(tweetService.getRecentTweets(userName, page, limit, search, sortBy, order, hashtags, highEngagement));
    }
}