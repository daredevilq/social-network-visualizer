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
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GraphService {

  private final GraphRepository graphRepository;
  private final AuthorRepository authorRepository;
  private final List<NodeQueryStrategy> nodeQueryStrategies;

  public GraphDataDto getGraph(GraphQueryRequest request, Optional<Integer> communityId) {
    GraphQueryRequest finalRequest = validateRequest(request);

    List<NodeDto> nodes = fetchRequestedNodes(finalRequest.nodeTypes(), communityId, false);
    System.out.println(nodes);
    List<NodeDto> uniqueNodes = deduplicateNodesByName(nodes);
    List<LinkDto> links = fetchRequestedLinks(finalRequest.relationTypes(), communityId);

    log.info(
        "Graph built (community: {}) | nodeTypes={} | relationTypes={} | nodes: {} total, {} unique | links: {}",
        communityId.map(String::valueOf).orElse("null"),
        finalRequest.nodeTypes(),
        finalRequest.relationTypes(),
        nodes.size(),
        uniqueNodes.size(),
        links.size());

    return new GraphDataDto(uniqueNodes, links);
  }

  public GraphDataDto fetchWorkspaceData() {
    List<NodeDto> nodes = fetchRequestedNodes(Set.of(NodeType.AUTHOR), Optional.empty(), true);
    List<LinkDto> links = graphRepository.findWorkspaceRelationships();

    return new GraphDataDto(nodes, links);
  }

  // TODO: the the problem is that we need to change the logic of displaying nodes and links
  // when we have HashtagDtp.name = "Google" and AuthorDto.name = "Google" (its real example)
  // frontend doesnt know that relation MENTIONS only apply to AUTHOR->AUTHOR and it linsk
  // HASHTAG->AUTHOR too
  // because we dont have information in LinkDto what type of node source and target is
  // fix shouldnt be complicated but we should do this in the next PR, for now we deduplicate by
  // name

  private List<NodeDto> deduplicateNodesByName(List<NodeDto> nodes) {
    Map<String, NodeDto> uniqueNodesMap = new LinkedHashMap<>();

    for (NodeDto node : nodes) {
      String nodeName = node.getId();
      if (nodeName != null && !uniqueNodesMap.containsKey(nodeName)) {
        uniqueNodesMap.put(nodeName, node);
      }
    }

    return new ArrayList<>(uniqueNodesMap.values());
  }

  private List<NodeDto> fetchRequestedNodes(
      Set<NodeType> nodeTypes, Optional<Integer> communityId, boolean inWorkspace) {
    if (nodeTypes == null || nodeTypes.isEmpty()) {
      log.warn("No node types requested, returning empty list");
      return Collections.emptyList();
    }

    return nodeTypes.stream()
        .flatMap(
            nodeType -> {
              NodeQueryStrategy strategy = findStrategyForNodeType(nodeType);
              return strategy.fetchNodes(communityId, inWorkspace).stream();
            })
        .collect(Collectors.toList());
  }

  private List<LinkDto> fetchRequestedLinks(
      Set<RelationType> relationTypes, Optional<Integer> communityId) {
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
        .orElseThrow(
            () -> new IllegalArgumentException("No strategy found for node type: " + nodeType));
  }

  private GraphQueryRequest validateRequest(GraphQueryRequest request) {
    Set<NodeType> nodeTypes = request.nodeTypes();
    Set<RelationType> relationTypes = request.relationTypes();

    if (nodeTypes == null || nodeTypes.isEmpty()) {
      nodeTypes = Set.of(NodeType.AUTHOR);
    }
    if (relationTypes == null || relationTypes.isEmpty()) {
      relationTypes = Set.of(RelationType.MENTIONS);
    }

    return new GraphQueryRequest(nodeTypes, relationTypes);
  }
}
