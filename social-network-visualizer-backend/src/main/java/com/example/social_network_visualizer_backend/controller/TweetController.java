package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.service.TweetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tweet")
@RequiredArgsConstructor
public class TweetController {
    private final TweetService tweetService;

    @GetMapping("/all/{userName}")
    public List<Tweet> getTenTweetsByAuthor(@PathVariable String userName) {
        return tweetService.getRecentTweets(userName);
    }
}