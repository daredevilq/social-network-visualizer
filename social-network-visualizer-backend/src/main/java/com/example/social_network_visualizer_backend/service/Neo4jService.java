package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.config.MetricConfigDto;
import com.example.social_network_visualizer_backend.dto.config.ProjectConfigDto;
import com.example.social_network_visualizer_backend.enums.NodeLabel;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.exceptions.Neo4jUnavailableException;
import com.example.social_network_visualizer_backend.repository.*;
import jakarta.validation.constraints.NotNull;
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
    private final AlgorithmRepository algorithmRepository;

    public void handleDatabaseDrop() {
        log.info("Dropping all nodes in the database...");
        graphRepository.deleteAllNodes();
        dropAllGdsGraphs();
        log.info("Database cleared successfully.");
    }

    public void dropAllGdsGraphs() {
        try {
            List<String> names = graphRepository.listGdsGraphs();
            for (String name : names) {
                log.info("Dropping temporary GDS graph: {}", name);
                graphRepository.dropGdsGraph(name);
            }
        } catch (Exception e) {
            log.trace("Graph does not exist or already dropped");
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
        throw new Neo4jUnavailableException("Neo4j is not available after " + MAX_CONNECTION_ATTEMPTS + " attempts.");
    }

    public void computeMetricsWithConfig(ProjectConfigDto cfg) {
        log.info("Computing metrics for project: {} with {} metric configurations", 
                cfg.projectName(), cfg.metrics().size());

        createRelationsInGraph();

        for (MetricConfigDto metricCfg : cfg.metrics()) {
            
            String tempGraphName = "g_%s_%s".formatted(cfg.projectName(), metricCfg.type().name().toLowerCase());

            log.info("Processing metric: {} - Graph: {}, Orientation: {}, NodeLabels: {}, Relations: {}", 
                    metricCfg.type(), tempGraphName, metricCfg.orientation(),
                    metricCfg.nodeLabels(), metricCfg.relationTypes());

            try {
                List<String> labels = metricCfg.nodeLabels().stream().map(NodeLabel::getLabel).toList();
                Map<String, Map<String, String>> rels = toGdsRelationMap(metricCfg.relationTypes(), metricCfg.orientation());
                
                graphRepository.createGraph(tempGraphName, labels, rels);
                log.debug("In-memory graph created: {}", tempGraphName);

                switch (metricCfg.type()) {
                    case PAGERANK -> {
                        algorithmRepository.computePageRank(tempGraphName);
                    }
                    case COMMUNITY -> {
                        algorithmRepository.createCommunities(tempGraphName);
                    }
                }

                // dropping temp graph in RAM memory
                graphRepository.dropGdsGraph(tempGraphName);

            } catch (Exception e) {
                log.error("Failed to compute metric {} for graph {}: {}", 
                        metricCfg.type(), tempGraphName, e.getMessage(), e);
                throw new RuntimeException("Failed to compute metric: " + metricCfg.type(), e);
            }
        }
        log.info("All metrics computed successfully for project: {}", cfg.projectName());
    }


    private void createRelationsInGraph() {
        relationshipRepository.createRelationshipAuthorMentionsAuthor();
        relationshipRepository.createRelationshipAuthorRetweetAuthor();
        relationshipRepository.createRelationshipAuthorRepliesAuthor();
        relationshipRepository.createRelationshipAuthorUsesHashtag();
        relationshipRepository.createRelationshipAuthorsShareHashtag();
        relationshipRepository.createRelationshipAuthorUsesCashtag();
        relationshipRepository.createRelationshipAuthorsShareCashtag();
        relationshipRepository.createQuoteRelationships();
        relationshipRepository.createRetweetRelationships();
        relationshipRepository.createReplyTotRelationships();
        relationshipRepository.createIndexForCommunity();

    }

    private Map<String, Map<String, String>> toGdsRelationMap(Set<RelationType> relationTypes, @NotNull Orientation orientation) {
        String orient = orientation == Orientation.UNDIRECTED ? "UNDIRECTED" : "NATURAL";
        return relationTypes.stream().collect(Collectors.toMap(
                RelationType::name,
                rt -> Map.of(
                        "type", rt.name(),
                        "orientation", orient
                )
        ));
    }

    public void createConstraints() {
        tweetRepository.createTweetIdConstraint();
        authorRepository.createAuthorUserNameConstraint();
        hashtagRepository.createHashtagConstraint();
    }
}
