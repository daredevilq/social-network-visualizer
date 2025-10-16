package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.exceptions.DatabaseUnavailableException;
import com.example.social_network_visualizer_backend.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class Neo4jService {
    private final static int MAX_CONNECTION_ATTEMPTS = 10;
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;
    private final HashtagRepository hashtagRepository;
    private final RelationshipRepository relationshipRepository;
    private final GraphRepository graphRepository;

    public void handleDatabaseDrop() {
        log.info("Dropping all nodes in the database...");
        graphRepository.deleteAllNodes();
        dropAllGdsGraphs();
        log.info("Database cleared successfully.");
    }

    public void dropAllGdsGraphs() {
        List<String> gdsGraphs = graphRepository.listGdsGraphs();
        for(String gdsGraph : gdsGraphs) {
            graphRepository.dropGdsGraph(gdsGraph);
        }
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
        throw new DatabaseUnavailableException("Neo4j is not available after " + MAX_CONNECTION_ATTEMPTS + " attempts.");
    }

    public void createRelationsInGraph() {
        relationshipRepository.createRelationshipAuthorMentionsAuthor();
        relationshipRepository.createRelationshipAuthorRetweetAuthor();
        relationshipRepository.createRelationshipAuthorRepliesAuthor();
        relationshipRepository.createRelationshipAuthorUsesHashtag();
        relationshipRepository.createRelationshipAuthorsShareHashtag();
        relationshipRepository.createQuoteRelationships();
        relationshipRepository.createRetweetRelationships();
        relationshipRepository.createReplyTotRelationships();
        relationshipRepository.createIndexForCommunity();

    }

    private Map<String, Map<String, String>> toGdsRelationMap(Set<RelationType> relationTypes) {
        return relationTypes.stream().collect(Collectors.toMap(
                RelationType::name,
                rt -> Map.of(
                        "type", rt.name(),
                        "orientation", "NATURAL"
                )
        ));
    }

    public void createConstraints() {
        tweetRepository.createTweetIdConstraint();
        authorRepository.createAuthorUserNameConstraint();
        hashtagRepository.createHashtagConstraint();
    }
}
