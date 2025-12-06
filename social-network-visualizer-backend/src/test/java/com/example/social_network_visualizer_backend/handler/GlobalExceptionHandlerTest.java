package com.example.social_network_visualizer_backend.handler;

import static org.junit.jupiter.api.Assertions.*;

import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.exceptions.WorkspaceException;
import jakarta.persistence.EntityNotFoundException;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

class GlobalExceptionHandlerTest {

  private GlobalExceptionHandler exceptionHandler;

  @BeforeEach
  void setUp() {
    exceptionHandler = new GlobalExceptionHandler();
  }

  @Test
  void testHandleNoResourceFoundException() {
    // Arrange
    NoResourceFoundException exception =
        new NoResourceFoundException(null, "Resource not found");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleNoResourceFoundException(exception);

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Requested URL not found", response.getBody().get("error"));
  }

  @Test
  void testHandleNoHandlerFoundException() {
    // Arrange
    NoHandlerFoundException exception =
        new NoHandlerFoundException("GET", "/nonexistent", null);

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleNoHandlerFoundException(exception);

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("The requested endpoint does not exist", response.getBody().get("error"));
  }

  @Test
  void testHandleIllegalArgumentException() {
    // Arrange
    IllegalArgumentException exception = new IllegalArgumentException("Invalid argument provided");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleIllegalArgumentException(exception);

    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Invalid argument provided", response.getBody().get("error"));
  }

  @Test
  void testHandleDatabaseUnavailableException() {
    // Arrange
    DatabaseUnavailableException exception =
        new DatabaseUnavailableException("Database connection failed");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleDatabaseUnavailableException(exception);

    // Assert
    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Database is not available", response.getBody().get("error"));
    assertEquals("Database connection failed", response.getBody().get("message"));
  }

  @Test
  void testHandleWorkspaceException_BadRequest() {
    // Arrange
    WorkspaceException exception =
        new WorkspaceException("Workspace validation failed", HttpStatus.BAD_REQUEST);

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleWorkspaceException(exception);

    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Workspace validation failed", response.getBody().get("error"));
  }

  @Test
  void testHandleWorkspaceException_NotFound() {
    // Arrange
    WorkspaceException exception =
        new WorkspaceException("Workspace not found", HttpStatus.NOT_FOUND);

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleWorkspaceException(exception);

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Workspace not found", response.getBody().get("error"));
  }

  @Test
  void testHandleGeneralException() {
    // Arrange
    Exception exception = new RuntimeException("Unexpected error");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleGeneralException(exception);

    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(
        "Unexpected error occurred. Please try again later.", response.getBody().get("error"));
  }

  @Test
  void testHandleResponseStatusException() {
    // Arrange
    ResponseStatusException exception =
        new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleResponseStatusException(exception);

    // Assert
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Access denied", response.getBody().get("error"));
  }

  @Test
  void testHandleHttpRequestMethodNotSupportedException() {
    // Arrange
    HttpRequestMethodNotSupportedException exception =
        new HttpRequestMethodNotSupportedException("POST");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleMethodNotSupported(exception);

    // Assert
    assertEquals(HttpStatus.METHOD_NOT_ALLOWED, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(
        "Method POST is not supported for this endpoint.", response.getBody().get("error"));
  }

  @Test
  void testHandleProjectException_NotFound() {
    // Arrange
    ProjectException exception = new ProjectException("Project not found", HttpStatus.NOT_FOUND);

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleProjectException(exception);

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Project not found", response.getBody().get("error"));
  }

  @Test
  void testHandleProjectException_BadRequest() {
    // Arrange
    ProjectException exception =
        new ProjectException("Invalid project data", HttpStatus.BAD_REQUEST);

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleProjectException(exception);

    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Invalid project data", response.getBody().get("error"));
  }

  @Test
  void testHandleEntityNotFoundException() {
    // Arrange
    EntityNotFoundException exception = new EntityNotFoundException("Entity with id 123 not found");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleEntityNotFoundExceptions(exception);

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals("Entity with id 123 not found", response.getBody().get("error"));
  }

  @Test
  void testHandleMethodArgumentTypeMismatchException() {
    // Arrange
    MethodArgumentTypeMismatchException exception =
        new MethodArgumentTypeMismatchException(
            "abc", Long.class, "id", null, new NumberFormatException());

    // Act
    ResponseEntity<Map<String, String>> response = exceptionHandler.handleTypeMismatch(exception);

    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertNotNull(response.getBody().get("error"));
  }

  @Test
  void testHandleNullPointerException() {
    // Arrange
    NullPointerException exception = new NullPointerException("Null value encountered");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleGeneralException(exception);

    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(
        "Unexpected error occurred. Please try again later.", response.getBody().get("error"));
  }

  @Test
  void testHandleIllegalStateException() {
    // Arrange
    IllegalStateException exception = new IllegalStateException("Invalid state");

    // Act
    ResponseEntity<Map<String, String>> response =
        exceptionHandler.handleGeneralException(exception);

    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(
        "Unexpected error occurred. Please try again later.", response.getBody().get("error"));
  }
}

