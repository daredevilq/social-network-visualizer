package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.AuthorStatsDto;
import com.example.social_network_visualizer_backend.dto.HashtagFrequency;
import com.example.social_network_visualizer_backend.dto.TweetPreviewDto;
import com.example.social_network_visualizer_backend.dto.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;

    public List<Tweet> findLast10TweetsByAuthor(String authorName) {
        System.out.println("Trying to get from database tweets with Author name: " + authorName);
        try {
            List<Tweet> top10ByAuthorName = authorRepository.findLast10TweetsByAuthorUsername(authorName);

            for (Tweet tweet : top10ByAuthorName) {
                System.out.println("Tweet: " + tweet);
            }
            return top10ByAuthorName;
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
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

    public Map<String, Long> getUserActivity(String authorName) {
        List<ZonedDateTime> userActivity = authorRepository.getUserActivity(authorName);

        return userActivity.stream()
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

    public List<String> findMentionsUsersByAuthor(String authorName) {
        return authorRepository.findMentionsUsersByAuthor(authorName);
    }

    public List<String> findAuthorRetweets(String authorName) {
        return authorRepository.findAuthorRetweets(authorName);
    }

    public List<String> findRetweetsByUser(String authorName) {
        return authorRepository.findRetweetsByUser(authorName);
    }

    public List<String> findMostCommonWords(String authorName) {
        List<String> tweetsContent = Optional.ofNullable(authorRepository.findTweetsContentByUser(authorName))
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

    public List<ActivityHeatmap> getUserActivityHeatmap(String authorName) {
        return authorRepository.getUserActivityHeatMap(authorName);
    }
}
