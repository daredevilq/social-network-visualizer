package com.example.social_network_visualizer_backend.exceptions;

public class Neo4jUnavailableException extends RuntimeException {
    public Neo4jUnavailableException(String message) {
        super(message);
    }
}