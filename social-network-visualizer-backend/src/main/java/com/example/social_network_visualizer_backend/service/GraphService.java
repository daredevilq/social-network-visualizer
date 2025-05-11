package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorLinkDto;
import com.example.social_network_visualizer_backend.dto.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.BridgeDto;
import com.example.social_network_visualizer_backend.dto.GraphDataDto;
import com.example.social_network_visualizer_backend.model.GraphDefinition;
import com.example.social_network_visualizer_backend.model.RelationType;
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
        return Arrays.stream(GraphDefinition.values())
                .filter(def -> def.name().equalsIgnoreCase(graphType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown graph type: " + graphType));
    }

    private GraphDataDto buildGraphUsingRelations(Set<RelationType> relations) {
        List<AuthorNodeDto> authorList = authorRepository.findAuthors();
        List<AuthorLinkDto> edgeList = authorRepository.findAuthorRelations(relations);

        return new GraphDataDto(authorList, edgeList);
    }

    public List<String> getAllGraphTypes() {
        return Arrays.stream(GraphDefinition.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    private GraphDataDto buildGraphUsingRelationsWithCommunity(Set<RelationType> relations, int communityId) {
        List<AuthorNodeDto> authorList = authorRepository.findAuthorsWithCommunity(communityId);
        List<AuthorLinkDto> edgeList = authorRepository.findAuthorRelationsWithinCommunity(relations, communityId);

        return new GraphDataDto(authorList, edgeList);
    }
}
