package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class GraphService {
    private final AuthorRepository authorRepository;

    // tofix
//    public List<BridgeDto> getAllBridges(String projectName) {
//        var cfg = projectConfigService.load(projectName);
//        return algorithmRepository.getAllBridges("bridges");
//    }

    public GraphDataDto getGraph(Set<RelationType> relations, Optional<Integer> communityId) {
        log.debug("Building graph with relations: {} for community: {}", relations, communityId.orElse(null));
        return communityId
                .map(id -> getGraphWithSpecificRelationsWithCommunity(relations, id))
                .orElseGet(() -> getGraphWithSpecificRelations(relations));
    }

    private GraphDataDto getGraphWithSpecificRelations(Set<RelationType> relations) {
        log.debug("Fetching full graph with relations: {}", relations);
        List<AuthorNodeDto> authorList = authorRepository.findAuthors();
        List<AuthorLinkDto> edgeList = authorRepository.findAuthorRelations(relations);

        return new GraphDataDto(authorList, edgeList);
    }

    private GraphDataDto getGraphWithSpecificRelationsWithCommunity(Set<RelationType> relations, int communityId) {
        log.debug("Fetching community graph (ID: {}) with relations: {}", communityId, relations);
        List<AuthorNodeDto> authorList = authorRepository.findAuthorsWithCommunity(communityId);
        List<AuthorLinkDto> edgeList = authorRepository.findAuthorRelationsWithinCommunity(relations, communityId);

        return new GraphDataDto(authorList, edgeList);
    }
}
