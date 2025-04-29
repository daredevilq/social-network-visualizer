package com.example.social_network_visualizer_backend.dto;

import java.util.List;

public record GraphDataDTO(
        List<String> nodes,
        List<AuthorLinkDTO> edges
) {
}
