package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.request.FetchConfig;
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

  record NodePreview(String id, String name, NodeType nodeType) {}

  record LinkPreview(String source, String target, RelationType type) {}

  public GraphDataDto getGraph(GraphQueryRequest request, Optional<Integer> communityId) {
    GraphQueryRequest finalRequest = validateRequest(request);

    List<NodeDto> nodes =
        fetchRequestedNodes(
            finalRequest.nodeTypes(), finalRequest.fetchConfig(), communityId, false);
    List<LinkDto> allLinks = fetchRequestedLinks(finalRequest.relationTypes(), communityId);

    Set<String> nodeIds = nodes.stream().map(NodeDto::getId).collect(Collectors.toSet());

    List<LinkDto> validLinks =
        allLinks.stream()
            .filter(link -> link.source() != null && link.target() != null)
            .collect(Collectors.toList());

    long selfLoopsCount =
        validLinks.stream()
            .filter(link -> nodeIds.contains(link.source()) && nodeIds.contains(link.target()))
            .filter(link -> link.source().equals(link.target()))
            .count();

    List<LinkDto> links =
        validLinks.stream()
            .filter(link -> nodeIds.contains(link.source()) && nodeIds.contains(link.target()))
            .filter(link -> !link.source().equals(link.target()))
            .collect(Collectors.toList());

    log.info(
        "Graph built (community: {}) | nodeTypes={} | relationTypes={} | fetchStrategy={} | nodes: {} | links: {} (filtered from {}, removed {} self-loops, {} null links)",
        communityId.map(String::valueOf).orElse("null"),
        finalRequest.nodeTypes(),
        finalRequest.relationTypes(),
        finalRequest.fetchConfig().strategy(),
        nodes.size(),
        links.size(),
        allLinks.size(),
        selfLoopsCount,
        allLinks.size() - validLinks.size());

    int nodeLimit = Math.min(nodes.size(), 5);
    int linkLimit = Math.min(links.size(), 10);

    // temp changes for logging purposes below
    List<NodePreview> nodePreview =
        nodes.stream()
            .limit(nodeLimit)
            .map(
                n ->
                    new NodePreview(
                        n.getId(),
                        n.getName().substring(0, Math.min(15, n.getName().length())),
                        n.getNodeType()))
            .toList();

    List<LinkPreview> linkPreview =
        links.stream()
            .limit(linkLimit)
            .map(l -> new LinkPreview(l.source(), l.target(), l.relation()))
            .toList();

    log.info("---------------------------");
    log.info("nodes preview: {}", nodePreview);
    log.info("links preview: {}", linkPreview);
    log.info("---------------------------");

    return new GraphDataDto(nodes, links);
  }

  public GraphDataDto fetchWorkspaceData() {
    List<NodeDto> nodes =
        fetchRequestedNodes(
            Set.of(NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG),
            FetchConfig.defaultConfig(),
            Optional.empty(),
            true);
    List<LinkDto> allLinks = graphRepository.findWorkspaceRelationships();

    Set<String> nodeIds = nodes.stream().map(NodeDto::getId).collect(Collectors.toSet());

    List<LinkDto> validLinks =
        allLinks.stream()
            .filter(link -> link.source() != null && link.target() != null)
            .collect(Collectors.toList());

    List<LinkDto> links =
        validLinks.stream()
            .filter(link -> nodeIds.contains(link.source()) && nodeIds.contains(link.target()))
            .filter(link -> !link.source().equals(link.target()))
            .collect(Collectors.toList());

    return new GraphDataDto(nodes, links);
  }

  private List<NodeDto> fetchRequestedNodes(
      Set<NodeType> nodeTypes,
      FetchConfig fetchConfig,
      Optional<Integer> communityId,
      boolean inWorkspace) {
    if (nodeTypes == null || nodeTypes.isEmpty()) {
      log.warn("No node types requested, returning empty list");
      return Collections.emptyList();
    }

    return nodeTypes.stream()
        .flatMap(
            nodeType -> {
              NodeQueryStrategy strategy = findStrategyForNodeType(nodeType);
              Integer limit = fetchConfig.getLimitForNodeType(nodeType);
              return strategy.fetchNodes(communityId, inWorkspace, limit).stream();
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
    FetchConfig fetchConfig = request.fetchConfig();

    if (nodeTypes == null || nodeTypes.isEmpty()) {
      nodeTypes = Set.of(NodeType.AUTHOR);
    }
    if (relationTypes == null || relationTypes.isEmpty()) {
      relationTypes = Set.of(RelationType.MENTIONS);
    }
    if (fetchConfig == null) {
      fetchConfig = FetchConfig.defaultConfig();
    }

    return new GraphQueryRequest(nodeTypes, relationTypes, fetchConfig);
  }

  public List<NodeSearchDto> getSuggestions(String query) {
    return graphRepository.performSearch(query);
  }
}
