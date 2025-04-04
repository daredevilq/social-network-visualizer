package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.model.Author;
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
        return authorService.findTop10TweetsByAuthor(authorName);
    }

    @GetMapping("/{authorName}")
    public Author findAuthorById(@PathVariable String authorName) {
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
}
