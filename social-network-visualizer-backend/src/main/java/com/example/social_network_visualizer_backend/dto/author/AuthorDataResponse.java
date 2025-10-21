package com.example.social_network_visualizer_backend.dto.author;

import lombok.Builder;

@Builder
public record AuthorDataResponse(
    String userName,
    String dateOfFirstTweet,
    long retweetsCount,
    long repliesCount,
    long tweetsCount,
    double averageRepliesCount,
    double averageRetweetsCount,
    double averageLikesCount) {}
