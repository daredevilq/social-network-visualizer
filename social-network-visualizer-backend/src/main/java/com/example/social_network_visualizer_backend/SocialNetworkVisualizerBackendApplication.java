package com.example.social_network_visualizer_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

@SpringBootApplication
public class SocialNetworkVisualizerBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialNetworkVisualizerBackendApplication.class, args);
    }
}
