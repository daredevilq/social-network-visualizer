package com.example.social_network_visualizer_backend.dto.community;

public record SizeCount(
        int communitySize,
        long memberCount
) {}