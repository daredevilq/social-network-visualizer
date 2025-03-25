package com.example.social_network_visualizer_backend.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import com.example.social_network_visualizer_backend.model.Author;

public interface AuthorRepository extends Neo4jRepository<Author, String> {

}

