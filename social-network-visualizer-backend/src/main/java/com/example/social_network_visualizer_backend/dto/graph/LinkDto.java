package com.example.social_network_visualizer_backend.dto.graph;

import com.example.social_network_visualizer_backend.enums.RelationType;

public record LinkDto(String source, String target, RelationType relation, Integer weight) {}
