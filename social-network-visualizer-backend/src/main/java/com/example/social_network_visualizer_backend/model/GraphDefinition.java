package com.example.social_network_visualizer_backend.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum GraphDefinition {
    AUTHOR_MENTIONS("g_author_mentions", GraphType.MENTIONS),
    AUTHOR_IMPORTANCE("g_author_importance", GraphType.RETWEETS_AND_MENTIONS);

    private final String graphName;
    private final GraphType type;
}

