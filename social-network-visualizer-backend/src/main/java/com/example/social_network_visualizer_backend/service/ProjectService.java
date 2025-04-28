package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
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
                    throw new ProjectException("Unable to read files in project: " + projectDir.getFileName(), e, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            });
        } catch (IOException e) {
            throw new ProjectException("Error reading the projects directory", e, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return projects;
    }

    public void loadProject(String projectName) {
        neo4jService.waitForNeo4jToBeAvailable();
        neo4jService.handleDatabaseDrop();

        Path projectPath = basePath.resolve(projectName);

        if (!Files.exists(projectPath) || !Files.isDirectory(projectPath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project " + projectName + " not found");
        }

        tweetsFolderParser.parseDirectory(projectPath);
        neo4jService.computeMetricsAndRelations();
        log.info(String.format("Project %s imported successfully",projectName));
    }

    public void createProject(String projectName, MultipartFile[] files) {
        Path projectDir = basePath.resolve(projectName);

        if (Files.exists(projectDir)) {
            throw new ProjectException("Project with name '" + projectName + "' already exists", HttpStatus.BAD_REQUEST);
        }

        try {
            Files.createDirectories(projectDir);
            log.info("Created new directory: {}", projectDir);

            addFilesToProject(projectName, files, projectDir);
        } catch (IOException e) {
            log.error("Error while creating project directory or saving files.", e);
            throw new ProjectException("Error while creating project '" + projectName + "': " + e.getMessage(), e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void updateProjectWithFiles(String projectName, MultipartFile[] files) {
        Path projectDir = basePath.resolve(projectName);

        if (!Files.exists(projectDir)) {
            throw new ProjectException("Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
        }

        addFilesToProject(projectName, files, projectDir);
    }

    private List<Path> addFilesToProject(String projectName, MultipartFile[] files, Path projectDir) {
        List<Path> jsonFiles = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                String filename = file.getOriginalFilename();
                if (filename == null || filename.isBlank()) {
                    throw new IllegalArgumentException("Filename cannot be null or empty");
                }

                if (file.isEmpty() || !filename.endsWith(".json")) {
                    log.warn("Skipped file: {}", filename);
                    continue;
                }

                String baseFilename = filename.substring(0, filename.lastIndexOf('.'));
                String extension = filename.substring(filename.lastIndexOf('.'));
                int version = 1;
                Path filePath = projectDir.resolve(filename);

                while (Files.exists(filePath)) {
                    filePath = projectDir.resolve(baseFilename + "_v" + version++ + extension);
                }

                try (InputStream inputStream = file.getInputStream()) {
                    Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                }

                jsonFiles.add(filePath);
            }

        } catch (IOException | IllegalArgumentException e) {
            log.error("Error while adding files to project '{}'", projectName, e);
            throw new ProjectException("Failed to add files to project '" + projectName + "': " + e.getMessage(), e, HttpStatus.BAD_REQUEST);
        }

        return jsonFiles;
    }

    public void deleteProject(String projectName) {
        Path projectPath = basePath.resolve(projectName);

        if (!Files.exists(projectPath) || !Files.isDirectory(projectPath)) {
            throw new ProjectException("Project '" + projectName + "' not found", HttpStatus.NOT_FOUND);
        }

        try (Stream<Path> paths = Files.walk(projectPath)) {
            paths.sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(file -> {
                        if (!file.delete()) {
                            throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath());
                        }
                    });
            log.info("Project '{}' deleted successfully.", projectName);

        } catch (IOException | RuntimeException e) {
            log.error("Error while deleting project '{}'", projectName, e);
            throw new ProjectException("Failed to delete project '" + projectName + "': " + e.getMessage(), e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<String> getProjectFileNames(String projectName) {
        Path projectDir = basePath.resolve(projectName);

        if (!Files.exists(projectDir) || !Files.isDirectory(projectDir)) {
            throw new ProjectException("Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
        }

        try (Stream<Path> files = Files.list(projectDir)) {
            return files
                    .filter(Files::isRegularFile)
                    .map(path -> path.getFileName().toString())
                    .toList();
        } catch (IOException e) {
            throw new ProjectException("Unable to read files for project '" + projectName + "'", e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void updateOpenedProject(String projectName, MultipartFile[] files) {
        Path projectDir = basePath.resolve(projectName);

        if (!Files.exists(projectDir)) {
            throw new ProjectException("Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
        }

        //List<Path> jsonFiles = addFilesToProject(projectName, files, projectDir);
        addFilesToProject(projectName, files, projectDir);
        //tweetsFolderParser.importFilesToDatabse(jsonFiles, false);
        loadProject(projectName);
    }

    public void deleteFileFromProject(String projectName, String fileName) {
        Path projectDir = basePath.resolve(projectName);

        if (!Files.exists(projectDir)) {
            throw new ProjectException("Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
        }
        Path filePath = projectDir.resolve(fileName);

        if (!Files.exists(filePath)) {
            throw new ProjectException("File '" + fileName + "' does not exist in project '" + projectName + "'", HttpStatus.NOT_FOUND);
        }

        try {
            boolean deleted = Files.deleteIfExists(filePath);
            if (!deleted) {
                throw new ProjectException("Failed to delete file '" + fileName + "' from project '" + projectName + "'", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            loadProject(projectName);
        } catch (IOException e) {
            throw new ProjectException("Error while deleting file '" + fileName + "' from project '" + projectName + "': " + e.getMessage(), e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
