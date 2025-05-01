package com.example.social_network_visualizer_backend.dto;

public record AuthorNodeDto(
        String name,
        Double pagerank,
        Double centrality,
        Integer community
) {
}