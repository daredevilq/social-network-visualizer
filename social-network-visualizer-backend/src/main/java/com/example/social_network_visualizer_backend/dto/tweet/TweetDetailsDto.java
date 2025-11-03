package com.example.social_network_visualizer_backend.dto.tweet;

import java.util.List;

public record TweetDetailsDto(
    String id,
    String url,
    String authorName,
    String content,
    List<String> photos,
    List<String> videos,
    Long likesCount,
    Long retweetsCount,
    Long repliesCount,
    Double engagement,
    Boolean isHighEngagement,
    String language,
    String objectType,
    List<String> hashtags,
    List<String> mentions,
    String replyToId,
    String replyToContent) {}
