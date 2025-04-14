package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TweetRelationService {
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;

    public void createTweetHashtagRelations(Map<String, TweetDto> tweetsMap) {
        List<Map<String, Object>> tweetHashtagsData = tweetsMap.values().stream()
                .filter(tweet -> tweet.getHashtags() != null)
                .flatMap(tweet -> tweet.getHashtags().stream().map(hashtag -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("tweetId", tweet.getId());
                    map.put("hashtag", hashtag);
                    return map;
                }))

                .toList();
        tweetRepository.createTweetHashtagRelations(tweetHashtagsData);
    }

    public void createTweetParentRelations(Map<String, TweetDto> tweetsMap) {
        List<Map<String, Object>> tweetParentData = tweetsMap.values().stream()
                .filter(tweet -> tweet.getParent() != null)
                .map(tweet -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("tweetId", tweet.getId());
                    map.put("parentId", tweet.getParent().getId());
                    return map;
                })
                .toList();
        tweetRepository.createTweetParentRelations(tweetParentData);
    }

    public void createTweetRepliesRelations(Map<String, TweetDto> tweetsMap) {
        List<Map<String, Object>> tweetRepliesData = tweetsMap.values().stream()
                .filter(tweet -> tweet.getReplies() != null)
                .flatMap(tweet -> tweet.getReplies().stream().map(reply -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("tweetId", tweet.getId());
                    map.put("userName", reply.getUsername());
                    return map;
                }))
                .toList();

        tweetRepository.createTweetRepliesRelations(tweetRepliesData);
    }

    public void createTweetMentionsRelations(Map<String, TweetDto> tweetsMap) {
        List<Map<String, Object>> tweetMentionsData = tweetsMap.values().stream()
                .filter(tweet -> tweet.getMentions() != null)
                .flatMap(tweet -> tweet.getMentions().stream().map(mention -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("tweetId", tweet.getId());
                    map.put("userName", mention.getUsername());
                    return map;
                }))
                .toList();

        tweetRepository.createTweetMentionsRelations(tweetMentionsData);
    }

    public void createAuthorTweetRelations(Map<String, TweetDto> tweetsMap) {
        List<Map<String, Object>> authorTweetData = tweetsMap.values().stream()
                .map(tweet -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("tweetId", tweet.getId());
                    map.put("userName", tweet.getAuthor().getUserName());
                    return map;
                })
                .toList();
        authorRepository.createAuthorTweetRelations(authorTweetData);
    }
}
