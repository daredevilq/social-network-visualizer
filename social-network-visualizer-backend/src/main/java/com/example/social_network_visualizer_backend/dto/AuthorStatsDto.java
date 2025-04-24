package com.example.social_network_visualizer_backend.dto;

import java.time.LocalDateTime;


public record AuthorStatsDto(
        LocalDateTime dateOfFirstTweet,
        Long tweetsCount,
        Long retweetsCount,
        Long repliesCount,
        Double averageRepliesCount,
        Double averageRetweetsCount,
        Double averageLikesCount
) {}
