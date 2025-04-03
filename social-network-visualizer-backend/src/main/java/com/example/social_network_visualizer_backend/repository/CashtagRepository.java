package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Cashtag;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface CashtagRepository extends Neo4jRepository<Cashtag, String> {

}
