package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagProfileDto;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.utils.WordOccurrenceCounter;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HashtagService {
  private static final int WORDS_LIMIT = 30;

  private final HashtagRepository hashtagRepository;

  public HashtagDetailsDto getHashtagDetails(String hashtagName, int authorLimit, int tweetLimit) {
    List<TopAuthorsDto> topUsers = findTopAuthorsByHashtag(hashtagName, authorLimit);
    List<ViralTweetDto> topTweets = findTopTweetsByHashtag(hashtagName, tweetLimit);
    return new HashtagDetailsDto(hashtagName, topUsers, topTweets);
  }

  public HashtagProfileDto getHashtagProfile(String hashtag) {
    return hashtagRepository.findHashtagProfile(hashtag);
  }

  public Map<String, Long> getHashtagActivity(String hashtag) {
    List<ZonedDateTime> hashtagActivity = hashtagRepository.getHashtagActivity(hashtag);

    return hashtagActivity.stream()
        .collect(
            Collectors.groupingBy(
                date -> date.getYear() + "-" + String.format("%02d", date.getMonthValue()),
                TreeMap::new,
                Collectors.counting()));
  }

  private List<TopAuthorsDto> findTopAuthorsByHashtag(String hashtagName, int limit) {
    return hashtagRepository.findTopAuthorsByHashtag(hashtagName, limit);
  }

  private List<ViralTweetDto> findTopTweetsByHashtag(String hashtagName, int limit) {
    return hashtagRepository.findTopTweetsByHashtag(hashtagName, limit);
  }

  public Map<String, Long> findMostCommonWords(String hashtagName) {
    List<String> tweetsContent =
        Optional.ofNullable(hashtagRepository.findTweetsContentByHashtag(hashtagName))
            .orElse(Collections.emptyList());
    return WordOccurrenceCounter.countOccurrences(tweetsContent, WORDS_LIMIT);
  }
}
