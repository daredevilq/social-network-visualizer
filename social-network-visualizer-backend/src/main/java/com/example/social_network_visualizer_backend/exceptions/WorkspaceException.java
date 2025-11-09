package com.example.social_network_visualizer_backend.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WorkspaceException extends RuntimeException {
  private final HttpStatus status;
  private final String bannerType;

  public WorkspaceException(String message, HttpStatus status, String bannerType) {
    super(message);
    this.status = status;
    this.bannerType = bannerType;
  }

  public WorkspaceException(String message, HttpStatus status) {
    this(message, status, "error");
  }

  public WorkspaceException(String message, Throwable cause, HttpStatus status, String bannerType) {
    super(message, cause);
    this.status = status;
    this.bannerType = bannerType;
  }

  public WorkspaceException(String message, Throwable cause, HttpStatus status) {
    this(message, cause, status, "error");
  }
}
