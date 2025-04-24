package com.example.social_network_visualizer_backend.dto;

import java.util.Date;

public record AuthorStatsDto(
        Date dateOfFirstTweet,
        Long tweetsCount,
        Long retweetsCount,
        Long repliesCount,
        Double averageRepliesCount,
        Double averageRetweetsCount,
        Double averageLikesCount
) {}
