package com.example.social_network_visualizer_backend.dto;

import java.util.List;

public record PaginatedTweetsDto (
        List<TweetWithStats> tweets,
        int total,
        int page,
        int totalPages
){
}
