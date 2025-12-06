package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

@ExtendWith(MockitoExtension.class)
class MongodbServiceTest {

  @Mock private MongoTemplate mongoTemplate;

  @Mock private MongoDatabase mongoDatabase;

  @InjectMocks private MongodbService mongodbService;

  @BeforeEach
  void setUp() {
    reset(mongoTemplate, mongoDatabase);
  }

  @Test
  void testWaitForMongoDBToBeAvailable_SuccessOnFirstAttempt() {
    // Arrange
    Document pingResponse = new Document("ok", 1);
    when(mongoTemplate.executeCommand("{ ping: 1 }")).thenReturn(pingResponse);

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    verify(mongoTemplate, times(1)).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_SuccessAfterRetries() {
    // Arrange
    Document pingResponse = new Document("ok", 1);
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenReturn(pingResponse);

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    verify(mongoTemplate, times(3)).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_SuccessAfterMultipleRetries() {
    // Arrange
    Document pingResponse = new Document("ok", 1);
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenReturn(pingResponse);

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    verify(mongoTemplate, times(6)).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_ThrowsExceptionAfterMaxAttempts() {
    // Arrange
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new RuntimeException("Connection failed"));

    // Act & Assert
    DatabaseUnavailableException exception =
        assertThrows(
            DatabaseUnavailableException.class, () -> mongodbService.waitForMongoDBToBeAvailable());

    assertTrue(exception.getMessage().contains("MongoDB is not available after"));
    assertTrue(exception.getMessage().contains("10 attempts"));
    verify(mongoTemplate, times(10)).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_HandlesInterruptedException() {
    // Arrange
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new RuntimeException("Connection failed"));
    Thread.currentThread().interrupt(); // Set interrupt flag

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    assertTrue(Thread.currentThread().isInterrupted());
    verify(mongoTemplate, atLeastOnce()).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_ExceptionMessageFormat() {
    // Arrange
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new RuntimeException("Connection failed"));

    // Act & Assert
    DatabaseUnavailableException exception =
        assertThrows(
            DatabaseUnavailableException.class, () -> mongodbService.waitForMongoDBToBeAvailable());

    assertEquals("MongoDB is not available after 10 attempts.", exception.getMessage());
  }

  @Test
  void testWaitForMongoDBToBeAvailable_DifferentExceptionTypes() {
    // Arrange
    Document pingResponse = new Document("ok", 1);
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new IllegalStateException("Database not ready"))
        .thenThrow(new NullPointerException("Connection null"))
        .thenReturn(pingResponse);

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    verify(mongoTemplate, times(3)).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_SuccessOnLastAttempt() {
    // Arrange
    Document pingResponse = new Document("ok", 1);
    when(mongoTemplate.executeCommand("{ ping: 1 }"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenThrow(new RuntimeException("Connection failed"))
        .thenReturn(pingResponse);

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    verify(mongoTemplate, times(10)).executeCommand("{ ping: 1 }");
  }

  @Test
  void testWaitForMongoDBToBeAvailable_PingCommandFormat() {
    // Arrange
    Document pingResponse = new Document("ok", 1);
    when(mongoTemplate.executeCommand("{ ping: 1 }")).thenReturn(pingResponse);

    // Act
    mongodbService.waitForMongoDBToBeAvailable();

    // Assert
    verify(mongoTemplate).executeCommand("{ ping: 1 }");
  }
}
