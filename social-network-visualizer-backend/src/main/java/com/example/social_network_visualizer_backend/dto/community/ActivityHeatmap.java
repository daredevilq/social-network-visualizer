package com.example.social_network_visualizer_backend.dto.community;

public record ActivityHeatmap(
        Integer hour, // 0-23
        Integer dayOfWeek, // 1-7 (1 = monday)
        Integer posts
) {

}
