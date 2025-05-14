package com.example.social_network_visualizer_backend.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

@Getter
@AllArgsConstructor
public enum GraphDefinition {
    AUTHOR_MENTIONS("g_author_mentions", GraphType.MENTIONS, Set.of(RelationType.MENTIONS)),
    AUTHOR_MENTIONS_AND_RETWEETS("g_author_importance", GraphType.RETWEETS_AND_MENTIONS, Set.of(RelationType.MENTIONS, RelationType.RETWEETS));

    private final String graphName;
    private final GraphType type;
    private final Set<RelationType> relationTypes;
}

