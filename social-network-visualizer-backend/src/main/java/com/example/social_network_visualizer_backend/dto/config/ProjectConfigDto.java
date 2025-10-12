package com.example.social_network_visualizer_backend.dto.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record ProjectConfigDto(
        @NotBlank String projectName,
        @NotNull Instant createdAt,
        @Valid @NotNull List<MetricConfigDto> metrics
) {
}