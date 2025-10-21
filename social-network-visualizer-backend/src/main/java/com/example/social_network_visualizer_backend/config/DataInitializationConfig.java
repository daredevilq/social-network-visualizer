package com.example.social_network_visualizer_backend.config;

import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import com.example.social_network_visualizer_backend.service.MongodbService;
import com.example.social_network_visualizer_backend.service.Neo4jService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializationConfig {
  @Value("${drop.mode:true}")
  private String dropMode;

  private final MongodbService mongodbService;
  private final Neo4jService neo4jService;

  @PostConstruct
  public void init() {
    try {
      neo4jService.waitForNeo4jToBeAvailable();
    } catch (DatabaseUnavailableException e) {
      throw new RuntimeException(
          "Neo4j is not available, cannot proceed with database operations.", e);
    }

    try {
      mongodbService.waitForMongoDBToBeAvailable();
    } catch (DatabaseUnavailableException e) {
      throw new RuntimeException(
          "MongoDB is not available, cannot proceed with database operations.", e);
    }

    if (Boolean.parseBoolean(dropMode)) {
      neo4jService.handleDatabaseDrop();
    }

    neo4jService.createConstraints();
  }
}
