package com.example.social_network_visualizer_backend.dto;

public record ViralTweetDto(
        String userName,
        String preview,
        String tweetUrl,
        int likes,
        int retweets,
        int replies,
        int engagementScore
) {}

