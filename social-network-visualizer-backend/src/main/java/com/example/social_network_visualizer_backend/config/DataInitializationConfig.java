package com.example.social_network_visualizer_backend.config;

import com.example.social_network_visualizer_backend.repository.TweetRepository;
import com.example.social_network_visualizer_backend.service.TweetsFolderParser;
import com.example.social_network_visualizer_backend.service.TweetsParser;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializationConfig {
    private final TweetsFolderParser tweetsFolderParser;
    private final TweetsParser tweetsParser;
    private final TweetRepository tweetRepository;

    @Value("${drop.mode:true}")
    private String dropMode;

    @Value("${loader.mode:dir}")
    private String loaderMode;

    @Value("${data.tweets.dir.path:./src/main/resources/data}")
    private String tweetsDataDirPath;

    @Value("${data.tweets.file.path:./src/main/resources/output.json}")
    private String tweetsDataFilePath;


    @PostConstruct
    public void init() {
        log.info("Starting data upload to Neo4j with loader mode: {}", loaderMode);
        try {
            handleDatabaseDrop();
            loadData();
        } catch (Exception e) {
            log.error("Error while uploading data to Neo4j", e);
        }
    }

    private void handleDatabaseDrop() {
        if (Boolean.parseBoolean(dropMode)) {
            log.info("Dropping all nodes in the database...");
            tweetRepository.deleteAllNodes();
            log.info("Database cleared successfully.");
        }
    }

    private void loadData() {
        switch (loaderMode.toLowerCase()) {
            case "dir" -> {
                log.info("Uploading data from directory: {}", tweetsDataDirPath);
                tweetsFolderParser.parseDirectory(tweetsDataDirPath);
            }
            case "file" -> {
                log.info("Uploading data from file: {}", tweetsDataFilePath);
                tweetsParser.parseJsonFileFromPath(tweetsDataFilePath);
            }
            default -> throw new IllegalArgumentException("Unknown loader mode: " + loaderMode);
        }
        log.info("Data upload completed successfully.");
    }
}