package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;

public interface TweetRepository extends Neo4jRepository<Tweet, String> {

    @Query("MATCH (tweet:Tweet) " +
            "OPTIONAL MATCH (author:Author {userName: $userName})-[:POSTED]->(tweet) " +
            "RETURN tweet{.*, author: author{.*, tweetList: null}} " +
            "LIMIT 10")
    List<Tweet> findTweetsWithRelationships(String userName);

    Page<Tweet> findAll(Pageable pageable);
}
