package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.GraphRepository;
import com.example.social_network_visualizer_backend.service.graph.NodeQueryStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class GraphService {
    
    private final GraphRepository graphRepository;
    private final AuthorRepository authorRepository;
    private final List<NodeQueryStrategy> nodeQueryStrategies;

    public GraphDataDto getGraph(GraphQueryRequest request, Optional<Integer> communityId) {
        log.info("Building graph with nodeTypes: {}, relations: {}, community: {}", 
                request.nodeTypes(), request.relationTypes(), communityId.orElse(null));

        List<NodeDto> nodes = fetchRequestedNodes(request.nodeTypes(), communityId);
        List<NodeDto> uniqueNodes = deduplicateNodesByName(nodes);

        List<LinkDto> links = fetchRequestedLinks(request.relationTypes(), communityId);

        log.info("Graph built successfully with {} unique nodes (from {} total) and {} links", 
                uniqueNodes.size(), nodes.size(), links.size());
        return new GraphDataDto(uniqueNodes, links);
    }

    private List<NodeDto> deduplicateNodesByName(List<NodeDto> nodes) {
        Map<String, NodeDto> uniqueNodesMap = new LinkedHashMap<>();

        for (NodeDto node : nodes) {
            String nodeName = node.getName();
            if (nodeName != null && !uniqueNodesMap.containsKey(nodeName)) {
                uniqueNodesMap.put(nodeName, node);
            }
        }
        
        return new ArrayList<>(uniqueNodesMap.values());
    }

    private List<NodeDto> fetchRequestedNodes(Set<NodeType> nodeTypes, Optional<Integer> communityId) {
        if (nodeTypes == null || nodeTypes.isEmpty()) {
            log.warn("No node types requested, returning empty list");
            return Collections.emptyList();
        }
        
        return nodeTypes.stream()
                .flatMap(nodeType -> {
                    NodeQueryStrategy strategy = findStrategyForNodeType(nodeType);
                    return strategy.fetchNodes(communityId).stream();
                })
                .collect(Collectors.toList());
    }
    
    private List<LinkDto> fetchRequestedLinks(Set<RelationType> relationTypes, Optional<Integer> communityId) {
        if (relationTypes == null || relationTypes.isEmpty()) {
            log.warn("No relation types requested, returning empty list");
            return Collections.emptyList();
        }
        
        if (communityId.isPresent()) {
            return authorRepository.findAuthorRelationsWithinCommunity(relationTypes, communityId.get());
        } else {
            return graphRepository.findAllRelations().stream()
                    .filter(link -> relationTypes.contains(link.relation()))
                    .collect(Collectors.toList());
        }
    }
    
    private NodeQueryStrategy findStrategyForNodeType(NodeType nodeType) {
        return nodeQueryStrategies.stream()
                .filter(strategy -> strategy.getNodeType() == nodeType)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No strategy found for node type: " + nodeType));
    }
}
