package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
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

    public Author findAuthorById(String authorName) {
        return authorRepository.findById(authorName).orElse(null);
    }

    public Map<String, Long> getUserActivity(String authorName) {
        List<ZonedDateTime> userActivity = authorRepository.getUserActivity(authorName);

        return userActivity.stream()
                .collect(Collectors.groupingBy(
                        date -> date.getYear() + "-" + String.format("%02d", date.getMonthValue()),
                        Collectors.counting()
                ));
    }

    public List<String> findShortestPathBetweenAuthors(String sourceName, String targetName) {
        return authorRepository.findShortestPathAuthors(sourceName, targetName);
    }
}
