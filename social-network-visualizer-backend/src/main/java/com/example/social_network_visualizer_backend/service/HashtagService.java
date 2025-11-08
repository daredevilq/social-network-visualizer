package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HashtagService {
  private final HashtagRepository hashtagRepository;

  public HashtagDetailsDto getHashtagDetails(String hashtagName) {
    List<TopAuthorsDto> topUsers = hashtagRepository.findTopUsersByHashtag(hashtagName);
    List<ViralTweetDto> topTweets = hashtagRepository.findTopTweetsByHashtag(hashtagName);
    return new HashtagDetailsDto(hashtagName, topUsers, topTweets);
  }
}
