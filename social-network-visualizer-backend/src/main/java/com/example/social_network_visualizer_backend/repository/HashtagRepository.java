package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Hashtag;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface HashtagRepository extends Neo4jRepository<Hashtag, String> {

}
