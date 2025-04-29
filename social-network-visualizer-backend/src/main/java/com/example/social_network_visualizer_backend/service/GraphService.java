package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.model.GraphDefinition;
import com.example.social_network_visualizer_backend.model.RelationType;
import com.example.social_network_visualizer_backend.repository.AlgorithmRepository;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GraphService {
    private final AlgorithmRepository algorithmRepository;
    private final AuthorRepository authorRepository;

    public List<BridgeDto> getAllBridges() {
        return algorithmRepository.getAllBridges();
    }

    public GraphDataDTO getGraph(String graphType, Optional<Integer> communityId) {
        GraphDefinition definition = getGraphDefinition(graphType);
        Set<RelationType> relations = definition.getRelationTypes();


        if (communityId.isPresent()) {
            return buildGraphUsingRelationsWithCommunity(relations, communityId.get());
        } else {
            return buildGraphUsingRelations(relations);
        }
    }

    private GraphDefinition getGraphDefinition(String graphType) {
        return Arrays.stream(GraphDefinition.values())
                .filter(def -> def.name().equalsIgnoreCase(graphType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown graph type: " + graphType));
    }

    private GraphDataDTO buildGraphUsingRelations(Set<RelationType> relations) {
        List<String> authorList = authorRepository.findAuthors();
        List<AuthorLinkDTO> edgeList = authorRepository.findAuthorRelations(relations);

        return new GraphDataDTO(authorList, edgeList);
    }

    public List<String> getAllGraphTypes() {
        return Arrays.stream(GraphDefinition.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    private GraphDataDTO buildGraphUsingRelationsWithCommunity(Set<RelationType> relations, int communityId) {
        List<String> authorList = authorRepository.findAuthorsWithCommunity(communityId);
        List<AuthorLinkDTO> edgeList = authorRepository.findAuthorRelationsWithinCommunity(relations, communityId);

        return new GraphDataDTO(authorList, edgeList);
    }
}

