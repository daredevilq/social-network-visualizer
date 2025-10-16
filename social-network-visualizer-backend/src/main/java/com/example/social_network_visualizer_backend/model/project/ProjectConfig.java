package com.example.social_network_visualizer_backend.model.project;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record ProjectConfig(
        @NotNull Instant createdAt,
        @Valid @NotNull List<MetricConfig> metrics
) {
}
