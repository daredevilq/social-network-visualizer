package com.example.social_network_visualizer_backend.dto.community;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;

import java.util.List;

public record CommunitySummary(
        int communityId,
        int memberCount,
        String topAuthor,
        double topPageRank,
        List<String> topHashtags,
        List<ActivityPoint> communityActivity
) {}