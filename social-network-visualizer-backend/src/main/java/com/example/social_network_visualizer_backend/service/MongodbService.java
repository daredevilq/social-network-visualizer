package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class MongodbService {
  private final MongoTemplate mongoTemplate;
  private static final int MAX_CONNECTION_ATTEMPTS = 10;

  public void waitForMongoDBToBeAvailable() {
    int attempt = 0;
    while (attempt < MAX_CONNECTION_ATTEMPTS) {
      try {
        mongoTemplate.executeCommand("{ ping: 1 }");
        log.info("MongoDB is available.");
        return;
      } catch (Exception e) {
        attempt++;
        log.warn(
            "Waiting for MongoDB to become available... attempt {}/{}",
            attempt,
            MAX_CONNECTION_ATTEMPTS);
        try {
          Thread.sleep(2000);
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          return;
        }
      }
    }
    throw new DatabaseUnavailableException(
        "MongoDB is not available after " + MAX_CONNECTION_ATTEMPTS + " attempts.");
  }

  public void dropMongo() {
    mongoTemplate.getDb().drop();
  }
}
