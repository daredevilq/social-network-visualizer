package com.example.social_network_visualizer_backend.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record AuthorDataResponse (
        String userName,
        String dateOfFirstTweet,
        long retweetsCount,
        long repliesCount,
        long tweetsCount,
        double averageRepliesCount,
        double averageRetweetsCount,
        double averageLikesCount
) {

}
