package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.AuthorDataResponse;
import com.example.social_network_visualizer_backend.dto.HashtagFrequency;
import com.example.social_network_visualizer_backend.dto.TweetPreviewDto;
import com.example.social_network_visualizer_backend.dto.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/author")
@RequiredArgsConstructor
public class AuthorController {
    private final AuthorService authorService;

    @GetMapping("/all/{authorName}")
    public List<Tweet> getAuthor(@PathVariable String authorName) {
        return authorService.findLast10TweetsByAuthor(authorName);
    }

    @GetMapping("/{authorName}")
    public AuthorDataResponse findAuthorById(@PathVariable String authorName) {
        return authorService.findAuthorById(authorName);
    }

    @GetMapping("/activity/{authorName}")
    public Map<String, Long> getAuthorActivity(@PathVariable String authorName) {
        return authorService.getUserActivity(authorName);
    }

    @GetMapping("/shortestPath/{source}")
    public List<String> findShortestPathBetweenAuthors(@PathVariable String source, @RequestParam String target) {
        return authorService.findShortestPathBetweenAuthors(source, target);
    }

    @GetMapping("/last-posts/{authorName}")
    public List<TweetPreviewDto> getLast3TweetUrls(@PathVariable String authorName) {
        return authorService.findLast3TweetUrlsByAuthor(authorName);
    }

    @GetMapping("/hashtags/{authorName}")
    public List<HashtagFrequency> getTopHashtags(@PathVariable String authorName) {
        return authorService.findTopHashtagsByAuthor(authorName);
    }

    @GetMapping("/mentions/{authorName}")
    public List<String> getMentionedUsers(@PathVariable String authorName) {
        return authorService.findMentionsUsersByAuthor(authorName);
    }

    @GetMapping("/most-common-words/{authorName}")
    public List<String> getTweetsContent(@PathVariable String authorName) {
        return authorService.findMostCommonWords(authorName);
    }

    @GetMapping("/retweets-by/{authorName}")
    public List<String> getAuthorRetweets(@PathVariable String authorName) {
        return authorService.findAuthorRetweets(authorName);
    }

    @GetMapping("/retweets-of/{authorName}")
    public List<String> getRetweetsByUsers(@PathVariable String authorName) {
        return authorService.findRetweetsByUser(authorName);
    }

    @GetMapping("/viral-tweets/{authorName}")
    public List<ViralTweetDto> getViralTweets(@PathVariable String authorName) {
        return authorService.findTheMostViralTweet(authorName);
    }

    @GetMapping("/heatmap/{authorName}")
    public List<ActivityHeatmap> getUserActivityHeatmap(@PathVariable String authorName) {
        return authorService.getUserActivityHeatmap(authorName);
    }
}
