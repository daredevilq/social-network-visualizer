package com.example.social_network_visualizer_backend.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Set;

@Getter
@AllArgsConstructor
public enum GraphDefinition {
    MENTIONS("mentions", "g_author_mentions", Set.of(NodeLabel.AUTHOR) ,  Set.of(RelationType.MENTIONS)),
    RETWEETS_AND_MENTIONS("retweets-and-mentions", "g_author_importance", Set.of(NodeLabel.AUTHOR), Set.of(RelationType.MENTIONS, RelationType.RETWEETS));

    private final String urlName;
    private final String graphName;
    private final Set<NodeLabel> nodeLabels;
    private final Set<RelationType> relationTypes;

    public static GraphDefinition fromUrlName(String urlName) {
        return Arrays.stream(values())
                .filter(def -> def.getUrlName().equalsIgnoreCase(urlName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid graph type: " + urlName));
    }

}

