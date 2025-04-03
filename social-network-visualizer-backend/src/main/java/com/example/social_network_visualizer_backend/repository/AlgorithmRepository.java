package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface AlgorithmRepository extends Neo4jRepository<Author, String> {
}
