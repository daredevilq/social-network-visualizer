package com.example.social_network_visualizer_backend.enums;

import lombok.Getter;

@Getter
public enum NodeLabel {
    AUTHOR("Author"),
    TWEET("Tweet"),
    HASHTAG("Hashtag");

    private final String label;

    NodeLabel(String label) {
        this.label = label;
    }
}