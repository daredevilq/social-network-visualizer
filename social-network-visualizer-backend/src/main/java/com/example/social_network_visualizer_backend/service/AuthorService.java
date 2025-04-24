package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.AuthorStatsDto;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;

    public List<Tweet> findTop10TweetsByAuthor(String authorName) {
        System.out.println("Trying to get from database tweets with Author name: " + authorName);
        try {
            List<Tweet> top10ByAuthorName = authorRepository.findTop10TweetsByAuthorUsername(authorName);

            for (Tweet tweet : top10ByAuthorName) {
                System.out.println("Tweet: " + tweet);
            }
            return top10ByAuthorName;
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
        return List.of();
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

        return AuthorDataResponse.builder()
                .userName(authorName)
                .dateOfFirstTweet(authorStatsDto.dateOfFirstTweet().toLocalDate())
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
}
