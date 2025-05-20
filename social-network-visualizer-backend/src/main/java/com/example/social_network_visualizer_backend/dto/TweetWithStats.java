package com.example.social_network_visualizer_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TweetWithStats(
        String id,
        String authorName,
        LocalDateTime publicationDate,
        String objectType,
        String language,
        String contentPreview,
        String content,
        String twitterId,
        String url,
        String conversationId,
        List<String> photos,
        List<String> videos,
        Long repliesCount,
        Long retweetsCount,
        Long likesCount,
        List<String> hashtags,
        Double engagement,
        Boolean isHighEngagement
) {}

