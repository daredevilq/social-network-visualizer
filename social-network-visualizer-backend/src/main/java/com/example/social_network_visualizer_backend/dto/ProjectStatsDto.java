package com.example.social_network_visualizer_backend.dto;

public record ProjectStatsDto(
        Long tweetsCount,
        Long usersCount,
        Long hashtagsCount,
        Long relationsCount,
        Long communitiesCount,
        Long retweetCount
) {}
