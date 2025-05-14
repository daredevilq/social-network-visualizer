package com.example.social_network_visualizer_backend.enums;

public enum TweetSortOption {
    DATE,
    LIKES,
    RETWEETS,
    REPLIES;

    public static TweetSortOption from(String value) {
        return TweetSortOption.valueOf(value.toUpperCase());
    }
}

