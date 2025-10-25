package com.example.social_network_visualizer_backend.controller;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/menu")
@CrossOrigin(origins = "*")
public class GraphMenuController {

    private final Random random = new Random();

    @GetMapping("/author/{authorId}/top-tweets")
    public ResponseEntity<GraphDataDto> getAuthorTopTweets(@PathVariable String authorId) {
        List<TweetNodeDto> tweets = new ArrayList<>();

        for (int i = 1; i <= 10; i++) {
            TweetNodeDto tweet = new TweetNodeDto();
            tweet.setName("tweet_" + authorId + "_" + i);
            tweet.setNodeType(NodeType.TWEET);
            tweet.setContent("dadadad");
            tweet.setAuthorName(authorId);
            tweet.setLikesCount((long) random.nextInt(10000));
            tweet.setRetweetsCount((long) random.nextInt(5000));
            tweet.setCommunity(random.nextInt(5) + 1);

            tweets.add(tweet);
        }

        GraphDataDto response = new GraphDataDto(new ArrayList<>(tweets), new ArrayList<>());
        return ResponseEntity.ok(response);
    }
}