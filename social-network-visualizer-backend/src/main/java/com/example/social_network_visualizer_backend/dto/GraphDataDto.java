package com.example.social_network_visualizer_backend.dto;

import java.util.List;

public record GraphDataDto(
        List<AuthorNodeDto> nodes,
        List<AuthorLinkDto> edges
) {
}
