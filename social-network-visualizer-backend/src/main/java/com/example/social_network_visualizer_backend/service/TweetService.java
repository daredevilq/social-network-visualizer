package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TweetService {
    private final TweetRepository tweetRepository;

    public List<Tweet> getRecentTweets(String userName) {
        System.out.println("Trying to get from database tweets");
        try {
            List<Tweet> tweets = tweetRepository.findTweetsWithRelationships(userName);
            for (Tweet tweet : tweets) {
                System.out.println(tweet);
            }
            return tweets;
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
        return List.of();
    }
}
