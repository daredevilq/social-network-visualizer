package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagDetailsDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagProfileDto;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HashtagService {
  private final HashtagRepository hashtagRepository;

  private static final Set<String> STOP_WORDS =
      Set.of(
          "the", "and", "is", "in", "at", "of", "a", "an", "to", "with", "on", "for", "as", "by",
          "that", "this", "these", "those", "are", "was", "were", "be", "been", "being", "or",
          "but", "so", "if", "then", "there", "their", "they", "them", "he", "she", "it", "we",
          "you", "i", "me", "my", "your", "his", "her", "its", "our", "us", "do", "does", "did",
          "from", "about", "into", "up", "down", "out", "over", "under", "again", "further", "here",
          "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
          "other", "some", "such", "no", "nor", "only", "own", "same", "than", "too", "very", "can",
          "will", "just", "http", "https", "rt", "co");

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

    return tweetsContent.stream()
        .flatMap(tweet -> Arrays.stream(tweet.toLowerCase().split("\\P{L}+")))
        .filter(word -> !word.isEmpty() && !STOP_WORDS.contains(word) && word.length() >= 2)
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
        .entrySet()
        .stream()
        .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
        .limit(30)
        .collect(
            Collectors.toMap(
                Map.Entry::getKey, Map.Entry::getValue, (v1, v2) -> v1, LinkedHashMap::new));
  }
}
