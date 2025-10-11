package com.example.social_network_visualizer_backend.dto.config;

import com.example.social_network_visualizer_backend.enums.NodeLabel;
import com.example.social_network_visualizer_backend.enums.RelationType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectConfigDto {
    @NotBlank
    private String projectName;

//    @Builder.Default
//    private boolean locked = true;

    private Instant createdAt;

    @Valid
    @NotNull
    private List<MetricConfig> metrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricConfig {
        @NotNull
        private MetricType type;
        @NotNull
        private EnumSet<NodeLabel> nodeLabels;
        @NotNull
        private EnumSet<RelationType> relationTypes;
        @NotNull
        private Orientation orientation;
//        private String weightProperty;
//        private String writeProperty;
    }

    public enum Orientation { NATURAL, UNDIRECTED }
    public enum MetricType { PAGERANK, COMMUNITY, DEGREE }

    private static String defaultWritePropertyFor(MetricType t) {
        return switch (t) {
            case PAGERANK -> "pagerank";
            case COMMUNITY -> "community";
            case DEGREE -> "degreeCentrality";
        };
    }
}


