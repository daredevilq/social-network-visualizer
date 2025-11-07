package com.example.social_network_visualizer_backend.dto.hashtag;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import java.util.List;

public record HashtagDetailsDto(
    String hashtag, List<TopAuthorsDto> topUsers, List<ViralTweetDto> topTweets) {}
