package com.example.social_network_visualizer_backend.exceptions;

import com.example.social_network_visualizer_backend.enums.WorkspaceImportResultStatus;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WorkspaceException extends RuntimeException {
  private final HttpStatus httpStatus;
  private final String importResultStatus;

  public WorkspaceException(String message, HttpStatus status, String importResultStatus) {
    super(message);
    this.httpStatus = status;
    this.importResultStatus = importResultStatus;
  }

  public WorkspaceException(String message, HttpStatus status) {
    this(message, status, WorkspaceImportResultStatus.ERROR.getLabel());
  }

  public WorkspaceException(
      String message, Throwable cause, HttpStatus status, String importResultStatus) {
    super(message, cause);
    this.httpStatus = status;
    this.importResultStatus = importResultStatus;
  }

  public WorkspaceException(String message, Throwable cause, HttpStatus status) {
    this(message, cause, status, WorkspaceImportResultStatus.ERROR.getLabel());
  }
}
