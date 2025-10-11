package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.config.ProjectConfigDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectConfigService {

    @Value("${data.projects.path}")
    private Path projectsBasePath;

    private final ObjectMapper mapper = new ObjectMapper()
            .findAndRegisterModules()
            .enable(SerializationFeature.INDENT_OUTPUT);

    public ProjectConfigDto load(String projectName) {
        Path file = configFile(projectName);
        if (!Files.exists(file)) {
            throw new IllegalStateException("Project config not found for " + projectName);
        }
        try {
            return mapper.readValue(file.toFile(), ProjectConfigDto.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read project config", e);
        }
    }

    public void save(ProjectConfigDto config) {
        Path file = configFile(config.getProjectName());
        try {
            Files.createDirectories(file.getParent());
            if (config.getCreatedAt() == null) config.setCreatedAt(Instant.now());
            mapper.writeValue(file.toFile(), config);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write project config", e);
        }
    }

    public boolean exists(String projectName) {
        return Files.exists(configFile(projectName));
    }

    private Path configFile(String projectName) {
        return projectsBasePath
                .resolve(projectName)
                .resolve("config")
                .resolve("project-config.json");
    }
}
