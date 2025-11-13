package com.example.social_network_visualizer_backend.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WorkspaceException extends RuntimeException {
  private final HttpStatus httpStatus;

  public WorkspaceException(String message, HttpStatus status) {
    super(message);
    this.httpStatus = status;
  }

  public WorkspaceException(String message, Throwable cause, HttpStatus status) {
    super(message, cause);
    this.httpStatus = status;
  }
}
