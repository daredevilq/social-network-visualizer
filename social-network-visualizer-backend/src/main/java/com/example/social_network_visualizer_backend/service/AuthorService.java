package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.author.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.author.AuthorStatsDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.dto.author.TweetPreviewDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;

    public List<Tweet> findLast10TweetsByAuthor(String authorName) {
        //        TODO: Check if this method works
        try {
            return authorRepository.findLast10TweetsByAuthorUsername(authorName);
        } catch (Exception e) {
            log.error("Error with Last10Tweets: {}", e.getMessage());
        }
        return List.of();
    }

    public List<TweetPreviewDto> findLast3TweetUrlsByAuthor(String authorName) {
        return authorRepository.findLast3TweetUrlsByAuthorUsername(authorName);
    }

    public AuthorDataResponse findAuthorById(String authorName) {
        AuthorStatsDto authorStatsDto = authorRepository.findStatsByAuthorId(authorName)
                .orElseThrow(() -> new EntityNotFoundException(String.format("Author %s not found", authorName)));

        BigDecimal averageReplies = new BigDecimal(authorStatsDto.averageRepliesCount())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal averageRetweets = new BigDecimal(authorStatsDto.averageRetweetsCount())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal averageLikes = new BigDecimal(authorStatsDto.averageLikesCount())
                .setScale(2, RoundingMode.HALF_UP);

        String dateOfFirstTweet = authorStatsDto.dateOfFirstTweet() != null
                ? authorStatsDto.dateOfFirstTweet().toLocalDate().toString()
                : "No data";

        return AuthorDataResponse.builder()
                .userName(authorName)
                .dateOfFirstTweet(dateOfFirstTweet)
                .tweetsCount(authorStatsDto.tweetsCount())
                .retweetsCount(authorStatsDto.retweetsCount())
                .repliesCount(authorStatsDto.repliesCount())
                .averageRepliesCount(averageReplies.doubleValue())
                .averageRetweetsCount(averageRetweets.doubleValue())
                .averageLikesCount(averageLikes.doubleValue())
                .build();
    }

    public Map<String, Long> getAuthorActivity(String authorName) {
        List<ZonedDateTime> authorActivity = authorRepository.getAuthorActivity(authorName);

        return authorActivity.stream()
                .collect(Collectors.groupingBy(
                        date -> date.getYear() + "-" + String.format("%02d", date.getMonthValue()),
                        TreeMap::new,
                        Collectors.counting()
                ));
    }

    public List<String> findShortestPathBetweenAuthors(String sourceName, String targetName) {
        return authorRepository.findShortestPathAuthors(sourceName, targetName);
    }

    public List<HashtagFrequency> findTopHashtagsByAuthor(String authorName) {
        return authorRepository.findTopHashtagsByAuthor(authorName);
    }

    public List<String> findMentionsAuthorsByAuthor(String authorName) {
        return authorRepository.findMentionsAuthorsByAuthor(authorName);
    }

    public List<String> findAuthorRetweets(String authorName) {
        return authorRepository.findAuthorRetweets(authorName);
    }

    public List<String> findRetweetsByAuthor(String authorName) {
        return authorRepository.findRetweetsByAuthor(authorName);
    }

    public List<String> findMostCommonWords(String authorName) {
//        TODO: Check if this method works
        List<String> tweetsContent = Optional.ofNullable(authorRepository.findTweetsContentByAuthor(authorName))
                .orElse(Collections.emptyList());

        Set<String> stopWords = Set.of(
                "the", "and", "is", "in", "at", "of", "a", "an", "to", "with", "on", "for", "as", "by", "that",
                "this", "these", "those", "are", "was", "were", "be", "been", "being", "or", "but", "so", "if",
                "then", "there", "their", "they", "them", "he", "she", "it", "we", "you", "i", "me", "my", "your",
                "his", "her", "its", "our", "us", "do", "does", "did", "from", "about", "into", "up", "down",
                "out", "over", "under", "again", "further", "here", "when", "where", "why", "how", "all", "any",
                "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "only", "own",
                "same", "than", "too", "very", "can", "will", "just"
        );

        return tweetsContent.stream()
                .flatMap(tweet -> Arrays.stream(tweet.toLowerCase().split("\\W+")))
                .filter(word -> !word.isEmpty() && !stopWords.contains(word) && word.length() > 2)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public List<ViralTweetDto> findTheMostViralTweet(String authorName) {
        return authorRepository.findTheMostViralTweet(authorName);
    }

    public List<ActivityHeatmap> getAuthorActivityHeatmap(String authorName) {
        return authorRepository.getAuthorActivityHeatMap(authorName);
    }
}
