package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.enums.GraphDefinition;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.repository.AlgorithmRepository;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GraphService {
    private final AlgorithmRepository algorithmRepository;
    private final AuthorRepository authorRepository;
    private final Neo4jService neo4jService;

    public List<BridgeDto> getAllBridges() {
        return algorithmRepository.getAllBridges();
    }

    public GraphDataDto getGraph(String graphType, Optional<Integer> communityId) {
        GraphDefinition definition = getGraphDefinition(graphType);
        Set<RelationType> relations = definition.getRelationTypes();


        if (communityId.isPresent()) {
            return buildGraphUsingRelationsWithCommunity(relations, communityId.get());
        } else {
            return buildGraphUsingRelations(relations);
        }
    }

    private GraphDefinition getGraphDefinition(String graphType) {
        String enumFormat = graphType.replace('-', '_').toUpperCase();

        return Arrays.stream(GraphDefinition.values())
                .filter(def -> def.name().equals(enumFormat))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown graph type: " + graphType));
    }

    private GraphDataDto buildGraphUsingRelations(Set<RelationType> relations) {
        List<AuthorNodeDto> authorList = authorRepository.findAuthors();
        List<AuthorLinkDto> edgeList = authorRepository.findAuthorRelations(relations);

        return new GraphDataDto(authorList, edgeList);
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
        List<AuthorNodeDto> authorList = authorRepository.findAuthorsWithCommunity(communityId);
        List<AuthorLinkDto> edgeList = authorRepository.findAuthorRelationsWithinCommunity(relations, communityId);

        return new GraphDataDto(authorList, edgeList);
    }

    public void setGraphType(String graphType) {
        GraphDefinition definition = GraphDefinition.fromUrlName(graphType);

        neo4jService.performAlgorithms(definition.getGraphName());
    }
}
