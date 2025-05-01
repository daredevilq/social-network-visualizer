package com.example.social_network_visualizer_backend.config;

import com.example.social_network_visualizer_backend.exceptions.Neo4jUnavailableException;
import com.example.social_network_visualizer_backend.service.Neo4jService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializationConfig {

    private final Neo4jService neo4jService;
    @Value("${drop.mode:true}")
    private String dropMode;

    @PostConstruct
    public void init() {
        try {
            neo4jService.waitForNeo4jToBeAvailable();
        } catch (Neo4jUnavailableException e) {
            throw new RuntimeException("Neo4j is not available, cannot proceed with database operations.", e);
        }

        if (Boolean.parseBoolean(dropMode)) {
            neo4jService.handleDatabaseDrop();
        }

        neo4jService.createConstraints();
    }
}