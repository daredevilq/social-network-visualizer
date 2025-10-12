package com.example.social_network_visualizer_backend.dto.config;

import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeLabel;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import jakarta.validation.constraints.NotNull;

import java.util.EnumSet;

public record MetricConfigDto(
        @NotNull MetricType type,
        @NotNull EnumSet<NodeLabel> nodeLabels,
        @NotNull EnumSet<RelationType> relationTypes,
        @NotNull Orientation orientation
) {
}