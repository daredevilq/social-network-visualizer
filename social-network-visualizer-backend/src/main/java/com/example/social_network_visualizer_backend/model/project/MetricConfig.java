package com.example.social_network_visualizer_backend.model.project;

import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record MetricConfig(
        @NotNull MetricType type,
        @NotNull Set<NodeType> nodeLabels,
        @NotNull Set<RelationType> relationTypes,
        @NotNull Orientation orientation
) {
}
