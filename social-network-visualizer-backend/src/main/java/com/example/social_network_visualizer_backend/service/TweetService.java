package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.PaginatedTweetsDto;
import com.example.social_network_visualizer_backend.dto.TweetWithStats;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.enums.TweetSortOption;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TweetService {
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;

    public PaginatedTweetsDto getRecentTweets(String userName, Integer page, Integer limit, String search, String sortBy, String order, List<String> hashtags, Boolean highEngagement) {
        if (page < 1 || limit <= 0) {
            throw new IllegalArgumentException("Page must be >= 1 and limit must be > 0");
        }

        if (userName != null) {
            Author author = authorRepository.findAuthorByUserName(userName)
                    .orElseThrow(() -> new EntityNotFoundException(String.format("Author %s not found", userName)));
        }

        TweetSortOption orderByField = TweetSortOption.from(sortBy);
        String orderDirection = validateOrder(order);
        List<TweetWithStats> allTweets = tweetRepository.findTweetsWithRelationships(userName, search, orderByField, orderDirection, hashtags, highEngagement);

        int total = allTweets.size();
        int totalPages = (int) Math.ceil((double) total / limit);

        if (page > totalPages) {
            return new PaginatedTweetsDto(Collections.emptyList(), total, page, totalPages);
        }

        int fromIndex = Math.max(0, (page - 1) * limit);
        int toIndex = Math.min(fromIndex + limit, total);

        List<TweetWithStats> paginatedTweets = allTweets.subList(fromIndex, toIndex);

        return new PaginatedTweetsDto(paginatedTweets, total, page, totalPages);
    }

    private String validateOrder(String order) {
        if ("asc".equalsIgnoreCase(order) || "desc".equalsIgnoreCase(order)) {
            return order.toUpperCase();
        }
        throw new IllegalArgumentException("Invalid order option. Use 'asc' or 'desc'.");
    }

}
