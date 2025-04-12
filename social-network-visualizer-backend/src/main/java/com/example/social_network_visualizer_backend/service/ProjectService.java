package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.exceptions.ProjectReadException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
    @Value("${data.projects.path}")
    private Path basePath;
    private final TweetsFolderParser tweetsFolderParser;
    private final Neo4jService neo4jService;

    public List<ProjectSummary> getAllProjects() {
        List<ProjectSummary> projects = new ArrayList<>();

        try (Stream<Path> paths = Files.list(basePath)) {
            paths.filter(Files::isDirectory).forEach(projectDir -> {
                try (Stream<Path> files = Files.list(projectDir)) {
                    long jsonFileCount = files
                            .filter(path -> path.toString().endsWith(".json"))
                            .count();

                    projects.add(new ProjectSummary(
                            projectDir.getFileName().toString(),
                            (int) jsonFileCount
                    ));

                } catch (IOException e) {
                    throw new ProjectReadException("Unable to read files in project: " + projectDir.getFileName(), e);
                }
            });
        } catch (IOException e) {
            throw new ProjectReadException("Error reading the projects directory", e);
        }

        return projects;
    }

    public void loadProject(String projectName) {
        neo4jService.waitForNeo4jToBeAvailable();
        neo4jService.handleDatabaseDrop();

        Path projectPath = basePath.resolve(projectName);

        if (!Files.exists(projectPath) || !Files.isDirectory(projectPath)) {
            throw new IllegalArgumentException(String.format("Project %s does not exist.", projectName), new Throwable("Project directory not found."));
        }

        tweetsFolderParser.parseDirectory(projectPath);
        neo4jService.computeMetricsAndRelations();
        log.info(String.format("Project %s imported successfully",projectName));
    }
}
