package com.example.social_network_visualizer_backend.dto;

public record CommunitySummary(
        int communityId,
        int memberCount,
        String topAuthor,
        double topPageRank
) {}