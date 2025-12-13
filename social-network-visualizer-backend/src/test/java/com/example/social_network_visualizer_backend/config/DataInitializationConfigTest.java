package com.example.social_network_visualizer_backend.config;

import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import com.example.social_network_visualizer_backend.service.MongodbService;
import com.example.social_network_visualizer_backend.service.Neo4jService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DataInitializationConfigTest {

  @Mock private MongodbService mongodbService;

  @Mock private Neo4jService neo4jService;

  @InjectMocks private DataInitializationConfig config;

  @BeforeEach
  void setUp() {
    try {
      var field = DataInitializationConfig.class.getDeclaredField("dropMode");
      field.setAccessible(true);
      field.set(config, "true");
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  void testInitCallsServices() throws DatabaseUnavailableException {
    config.init();

    verify(neo4jService, times(1)).waitForNeo4jToBeAvailable();
    verify(mongodbService, times(1)).waitForMongoDBToBeAvailable();
    verify(neo4jService, times(1)).handleDatabaseDrop();
    verify(neo4jService, times(1)).createConstraints();
  }

  @Test
  void testInitThrowsWhenNeo4jUnavailable() throws DatabaseUnavailableException {
    doThrow(new DatabaseUnavailableException("Neo4j down"))
        .when(neo4jService)
        .waitForNeo4jToBeAvailable();

    try {
      config.init();
      throw new AssertionError("Expected RuntimeException");
    } catch (RuntimeException e) {
      assert e.getMessage().contains("Neo4j is not available");
    }
  }

  @Test
  void testInitThrowsWhenMongoUnavailable() throws DatabaseUnavailableException {
    doThrow(new DatabaseUnavailableException("Mongo down"))
        .when(mongodbService)
        .waitForMongoDBToBeAvailable();

    try {
      config.init();
      throw new AssertionError("Expected RuntimeException");
    } catch (RuntimeException e) {
      assert e.getMessage().contains("MongoDB is not available");
    }
  }
}
