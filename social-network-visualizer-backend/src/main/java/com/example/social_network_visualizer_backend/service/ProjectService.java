package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.model.project.ProjectFile;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import com.example.social_network_visualizer_backend.service.metric.MetricComputationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectParser projectParser;
    private final Neo4jService neo4jService;
    private final MongodbService mongodbService;
    private final ProjectRepository projectRepository;
    private final GridFsService gridFsService;
    private final MetricComputationService metricComputationService;
    private final ObjectMapper objectMapper;

    public List<ProjectSummary> getAllProjects() {
        List<ProjectSummary> summaries = projectRepository.findAll()
                .stream()
                .map(project -> new ProjectSummary(
                        project.getName(),
                        project.getFiles() != null ? project.getFiles().size() : 0
                ))
                .collect(Collectors.toList());

        log.info("Found {} projects", summaries.size());
        return summaries;
    }

    public int importProject(String projectName) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> {
                    log.error("Project '{}' not found", projectName);
                    return new ProjectException("Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
                });

        neo4jService.waitForNeo4jToBeAvailable();
        mongodbService.waitForMongoDBToBeAvailable();
        neo4jService.handleDatabaseDrop();

        int importedTweets = projectParser.parseDirectory(projectName);

        neo4jService.createRelationsInGraph();
        metricComputationService.computeMetrics(projectName, project.getConfig());

        
        log.info("Project {} imported successfully with {} tweets", projectName, importedTweets);
        return importedTweets;
    }
    

    public List<String> createProject(String projectName, ProjectConfig projectConfig, MultipartFile[] files) {
        Project project = Project.builder()
                .name(projectName)
                .config(projectConfig)
                .files(new ArrayList<>())
                .build();

        projectRepository.save(project);

        List<String> skippedFiles = addFilesToProject(project, files);

        try {
            projectRepository.save(project);
            log.info("Project '{}' created successfully with {} files ({} skipped)",
                    projectName, files.length - skippedFiles.size(), skippedFiles.size());
        } catch (Exception e) {
            log.error("Error while saving new project '{}'", projectName, e);
            throw new ProjectException(
                    "Failed to save project '" + projectName + "' after adding files: " + e.getMessage(),
                    e, HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return skippedFiles;
    }

    public List<String> updateProjectWithFiles(String projectName, MultipartFile[] files) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> {
                    log.error("Project '{}' does not exist", projectName);
                    return new ProjectException(
                            "Project with name '" + projectName + "' does not exist",
                            HttpStatus.NOT_FOUND
                    );
                });

        if (project.getFiles() == null) {
            project.setFiles(new ArrayList<>());
        }

        List<String> skippedFiles = addFilesToProject(project, files);

        try {
            projectRepository.save(project);
            log.info("Added {} new files to project '{}' ({} skipped)",
                    files.length - skippedFiles.size(), projectName, skippedFiles.size());
        } catch (Exception e) {
            log.error("Error while saving project '{}' to MongoDB", projectName, e);
            throw new ProjectException(
                    "Failed to update project '" + projectName + "' with files: " + e.getMessage(),
                    e,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return skippedFiles;
    }

    private boolean fileExists(Project project, String filename) {
        return project.getFiles().stream().anyMatch(f -> f.getFilename().equals(filename));
    }

    private List<String> addFilesToProject(Project project, MultipartFile[] files) {
        List<String> skippedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();

            if (filename == null || filename.isBlank()) {
                log.warn("Skipped file with empty name");
                skippedFiles.add("Unnamed file");
                continue;
            }

            if (file.isEmpty() || !filename.endsWith(".json")) {
                log.warn("Skipped file '{}' (empty or invalid type)", filename);
                skippedFiles.add(filename);
                continue;
            }

            String baseFilename = filename.substring(0, filename.lastIndexOf('.'));
            String extension = filename.substring(filename.lastIndexOf('.'));
            String finalFilename = filename;
            int version = 1;

            while (fileExists(project, finalFilename)) {
                finalFilename = baseFilename + "_v" + version++ + extension;
            }

            try {
                // actual file we store in gridFS, in ProjectFile we strore only ID
                String gridFsId = gridFsService.storeFile(project.getName(), file);
                
                ProjectFile projectFile = ProjectFile.builder()
                        .filename(finalFilename)
                        .gridFsId(gridFsId)
                        .sizeInBytes(file.getSize())
                        .build();
                        
                project.getFiles().add(projectFile);
                log.info("Added file '{}' to project '{}' (size: {} bytes, GridFS ID: {})",
                        finalFilename, project.getName(), file.getSize(), gridFsId);
                        
            } catch (IOException e) {
                log.error("Error while reading file '{}'", filename, e);
                skippedFiles.add(filename);
            }
        }

        return skippedFiles;
    }

    public void deleteProject(String projectName) {
        Optional<Project> projectOpt = projectRepository.findByName(projectName);

        if (projectOpt.isEmpty()) {
            log.error("Project '{}' not found for deletion", projectName);
            throw new ProjectException(
                    "Project '" + projectName + "' not found",
                    HttpStatus.NOT_FOUND
            );
        }

        try {

            gridFsService.deleteProjectFiles(projectName);
            projectRepository.deleteByName(projectName);

            log.info("Project '{}' and all its files deleted successfully.", projectName);
        } catch (Exception e) {
            log.error("Error while deleting project '{}' from MongoDB", projectName, e);
            throw new ProjectException(
                    "Failed to delete project '" + projectName + "': " + e.getMessage(),
                    e,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    public List<String> getProjectFileNames(String projectName) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> {
                    log.error("Project '{}' not found", projectName);
                    return new ProjectException(
                            "Project with name '" + projectName + "' does not exist",
                            HttpStatus.NOT_FOUND
                    );
                });

        if (project.getFiles() == null || project.getFiles().isEmpty()) {
            log.warn("Project '{}' has no files", projectName);
            return Collections.emptyList();
        }

        List<String> filenames = project.getFiles()
                .stream()
                .map(ProjectFile::getFilename)
                .toList();

        log.info("Project '{}' has {} files", projectName, filenames.size());
        return filenames;
    }

    public List<String> updateOpenedProject(String projectName, MultipartFile[] files) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> {
                    log.error("Project '{}' not found", projectName);
                    return new ProjectException(
                            "Project with name '" + projectName + "' does not exist",
                            HttpStatus.NOT_FOUND
                    );
                });

        if (project.getFiles() == null) {
            project.setFiles(new ArrayList<>());
        }

        List<String> skippedFiles = addFilesToProject(project, files);

        try {
            projectRepository.save(project);
        } catch (Exception e) {
            log.error("Error while saving project '{}' to MongoDB", projectName, e);
            throw new ProjectException(
                    "Failed to update project '" + projectName + "' with files: " + e.getMessage(),
                    e,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        projectParser.importFilesToDatabase(new ArrayList<>(), false);

        neo4jService.dropAllGdsGraphs();
        neo4jService.createRelationsInGraph();

        Project reloadedProject = projectRepository.findByName(projectName)
                .orElseThrow(() -> new ProjectException("Project '" + projectName + "' not found after update",
                        HttpStatus.INTERNAL_SERVER_ERROR));
        
        if (reloadedProject.getConfig() != null && reloadedProject.getConfig().metrics() != null) {
            metricComputationService.computeMetrics(projectName, reloadedProject.getConfig());
        }

        return skippedFiles;
    }

    public void deleteFileFromProject(String projectName, String fileName) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> {
                    log.error("Project '{}' not found", projectName);
                    return new ProjectException(
                            "Project with name '" + projectName + "' does not exist",
                            HttpStatus.NOT_FOUND
                    );
                });

        if (project.getFiles() == null || project.getFiles().isEmpty()) {
            log.error("File '{}' not found in empty project '{}'", fileName, projectName);
            throw new ProjectException(
                    "File '" + fileName + "' does not exist in project '" + projectName + "'",
                    HttpStatus.NOT_FOUND
            );
        }

        ProjectFile fileToDelete = project.getFiles().stream()
                .filter(file -> file.getFilename().equals(fileName))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("File '{}' not found in project '{}'", fileName, projectName);
                    return new ProjectException("File '" + fileName + "' does not exist in project '" + projectName + "'",
                            HttpStatus.NOT_FOUND
                    );
                });

        try {
            gridFsService.deleteFile(fileToDelete.getGridFsId());
            project.getFiles().removeIf(file -> file.getFilename().equals(fileName));

            projectRepository.save(project);
            log.info("File '{}' deleted successfully from project '{}'", fileName, projectName);
        } catch (Exception e) {
            log.error("Error while deleting file '{}' from project '{}'", fileName, projectName, e);
            throw new ProjectException(
                    "Failed to delete file '" + fileName + "' from project '" + projectName + "': " + e.getMessage(),
                    e,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    public ProjectConfig getProjectConfig(String projectName) {
        Project project = projectRepository.findByName(projectName)
                .orElseThrow(() -> {
                    log.error("Project '{}' not found", projectName);
                    return new ProjectException("Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
                });
        
        log.info("Retrieved config for project: {}", projectName);
        return project.getConfig();
    }

    public List<MetricConfig> getDefaultMetrics() {
        try {
            ClassPathResource resource = new ClassPathResource("defaultMetrics.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<MetricConfig> defaultMetrics = objectMapper.readValue(inputStream, new TypeReference<List<MetricConfig>>() {});
                log.info("Loaded {} default metrics from configuration", defaultMetrics.size());
                return defaultMetrics;
            }
        } catch (IOException e) {
            log.error("Failed to load default metrics configuration", e);
            throw new ProjectException(
                    "Failed to load default metrics configuration: " + e.getMessage(), e, HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
