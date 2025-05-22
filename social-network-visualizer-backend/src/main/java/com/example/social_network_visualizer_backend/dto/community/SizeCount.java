package com.example.social_network_visualizer_backend.dto.community;

import java.util.Map;

public record SizeCount(
        int communitySize,
        long memberCount
) {}