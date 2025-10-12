package com.example.social_network_visualizer_backend.enums;

public enum MetricType { PAGERANK, COMMUNITY;

    private static String defaultWritePropertyFor(MetricType t) {
        return switch (t) {
            case PAGERANK -> "pagerank";
            case COMMUNITY -> "community";
        };
    }
}
