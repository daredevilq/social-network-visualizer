package com.example.social_network_visualizer_backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public class ProjectException extends RuntimeException {
    private final HttpStatus status;

    public ProjectException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public ProjectException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatusCode getStatus() {
        return status;
    }
}
