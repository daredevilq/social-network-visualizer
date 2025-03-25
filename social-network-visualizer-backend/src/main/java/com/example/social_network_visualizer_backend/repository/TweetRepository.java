package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface TweetRepository extends Neo4jRepository<Tweet, String> {
}
