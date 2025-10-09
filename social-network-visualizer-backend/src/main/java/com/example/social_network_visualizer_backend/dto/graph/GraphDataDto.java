package com.example.social_network_visualizer_backend.dto.graph;

import com.example.social_network_visualizer_backend.dto.graph.graphLink.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;

import java.util.List;

public record GraphDataDto(
        List<NodeDto> nodes,
        List<LinkDto> edges
) {
}
