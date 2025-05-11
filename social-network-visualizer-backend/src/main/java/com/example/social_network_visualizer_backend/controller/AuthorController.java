package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.AuthorDataResponse;
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
    public List<String> getLastPosts(@PathVariable String authorName) {
//        TODO Something wrong happens with data conversion ???
        List<Tweet> last10Tweets = authorService.findLast10TweetsByAuthor(authorName);
//        List<String> urls = last10Tweets.stream().map(Tweet::getUrl).toList();
//        System.out.println("Urls: " + urls);
//        return urls;
        return List.of(
                "https://x.com/elonmusk/status/1896011433592393791",
                "https://x.com/i/grok/share/jnf4ETmvGA6e6yGq9fUyM3Ykl",
                "https://x.com/elonmusk/status/1868822817611170207",
                "https://x.com/elonmusk/status/1904274990150603135",
                "https://x.com/elonmusk/status/1782202200703250805",
                "https://x.com/elonmusk/status/1255380013488189440"
        );
    }
}
