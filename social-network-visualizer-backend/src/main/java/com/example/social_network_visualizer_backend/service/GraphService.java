package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.BridgeDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphTypeDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.GraphDefinition;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.repository.AlgorithmRepository;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.GraphRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class GraphService {
    private final AlgorithmRepository algorithmRepository;
    private final AuthorRepository authorRepository;
    private final Neo4jService neo4jService;
    private final TweetRepository tweetRepository;
    private final HashtagRepository hashtagRepository;
    private final GraphRepository graphRepository;

    public List<BridgeDto> getAllBridges() {
        return algorithmRepository.getAllBridges();
    }

    public GraphDataDto getGraph(String graphType, Optional<Integer> communityId) {
        GraphDefinition definition = getGraphDefinition(graphType);
        Set<RelationType> relations = definition.getRelationTypes();

        return communityId.map(
                        integer -> buildGraphUsingRelationsWithCommunity(relations, integer))
                .orElseGet(this::buildGraphUsingRelations);
    }

    private GraphDefinition getGraphDefinition(String graphType) {
        String enumFormat = graphType.replace('-', '_').toUpperCase();

        return Arrays.stream(GraphDefinition.values())
                .filter(def -> def.name().equals(enumFormat))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown graph type: " + graphType));
    }

    private GraphDataDto buildGraphUsingRelations() {
        List<NodeDto> graphNodes = getNodes();
        List<LinkDto> graphLinks = getLinks();

        return new GraphDataDto(graphNodes, graphLinks);
    }

    public List<GraphTypeDto> getAllGraphTypes() {
        return Arrays.stream(GraphDefinition.values())
                .map(def -> new GraphTypeDto(
                        def.getUrlName(),
                        toReadableLabel(def.name())
                ))
                .collect(Collectors.toList());
    }

    private String toReadableLabel(String enumName) {
        return Arrays.stream(enumName.split("_"))
                .map(word -> word.charAt(0) + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private GraphDataDto buildGraphUsingRelationsWithCommunity(Set<RelationType> relations, int communityId) {
        List<NodeDto> graphNodes = new ArrayList<>(authorRepository.findAuthorsWithCommunity(communityId));
        List<LinkDto> graphLinks = authorRepository.findAuthorRelationsWithinCommunity(relations, communityId);

        return new GraphDataDto(graphNodes, graphLinks);
    }

    public void setGraphType(String graphType) {
        GraphDefinition definition = GraphDefinition.fromUrlName(graphType);

        neo4jService.performAlgorithms(definition.getGraphName());
    }

    private List<NodeDto> getNodes() {
        return Stream.of(
                        authorRepository.findAuthors(),
                        tweetRepository.findTweets(),
                        hashtagRepository.findHashtag()
                )
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    private List<LinkDto> getLinks() {
        return Stream.of(
                        graphRepository.findAllRelations()
                )
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }
}
