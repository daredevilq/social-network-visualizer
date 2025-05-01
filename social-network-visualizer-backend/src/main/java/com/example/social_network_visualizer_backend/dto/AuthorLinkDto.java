package com.example.social_network_visualizer_backend.dto;

import com.example.social_network_visualizer_backend.model.RelationType;

public record AuthorLinkDto(
        String source,
        String target,
        RelationType relation
) {}