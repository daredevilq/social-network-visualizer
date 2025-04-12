package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.exceptions.Neo4jUnavailableException;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class Neo4jService {
    private final static int MAX_CONNECTION_ATTEMPTS = 10;
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;

    public void handleDatabaseDrop() {
        log.info("Dropping all nodes in the database...");
        tweetRepository.deleteAllNodes();
        tweetRepository.dropAllGdsGraphs();
        log.info("Database cleared successfully.");
    }

    public void waitForNeo4jToBeAvailable() {
        int attempt = 0;
        while (attempt < MAX_CONNECTION_ATTEMPTS) {
            try {
                tweetRepository.count();
                log.info("Neo4j is available.");
                return;
            } catch (Exception e) {
                attempt++;
                log.warn("Waiting for Neo4j to become available... attempt {}/{}", attempt, MAX_CONNECTION_ATTEMPTS);
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
        throw new Neo4jUnavailableException("Neo4j is not available after " + MAX_CONNECTION_ATTEMPTS + " attempts.");
    }

    public void computeMetricsAndRelations(){
        authorRepository.createRelationshipAuthorMentionsAuthor();
        authorRepository.createRelationshipAuthorRetweetAuthor();
        authorRepository.createGdsGraph();
        authorRepository.createImportanceGraph();
        authorRepository.computePageRank();
        authorRepository.createCommunities();
        authorRepository.computeAuthorDegree();
    }
}
