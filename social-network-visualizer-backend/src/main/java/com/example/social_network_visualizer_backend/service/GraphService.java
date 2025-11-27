package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.request.BridgesRequest;
import com.example.social_network_visualizer_backend.dto.request.FetchConfig;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
import com.example.social_network_visualizer_backend.dto.request.ShortestPathRequest;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
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
  private final MetricComputationService metricComputationService;

  public GraphDataDto getGraph(GraphQueryRequest request, Optional<Integer> communityId) {
    GraphQueryRequest finalRequest = validateRequest(request);

    List<NodeDto> nodes =
        fetchRequestedNodes(
            finalRequest.nodeTypes(), finalRequest.fetchConfig(), communityId, false);
    Set<String> nodeIds = nodes.stream().map(NodeDto::getId).collect(Collectors.toSet());
    List<LinkDto> links = fetchRequestedLinks(finalRequest.relationTypes(), nodeIds, communityId);

    log.info(
        "Graph fetched (community: {}) | nodeTypes={} | relationTypes={} | fetchStrategy={} | nodes: {} | links: {}",
        communityId.map(String::valueOf).orElse("null"),
        finalRequest.nodeTypes(),
        finalRequest.relationTypes(),
        finalRequest.fetchConfig().strategy(),
        nodes.size(),
        links.size());

    return new GraphDataDto(nodes, links);
  }

  public GraphDataDto fetchWorkspaceData() {
    List<NodeDto> nodes =
        fetchRequestedNodes(
            Set.of(NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG),
            FetchConfig.defaultConfig(),
            Optional.empty(),
            true);
    List<LinkDto> links = graphRepository.findWorkspaceRelationships();

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
      Set<RelationType> relationTypes, Set<String> nodeIds, Optional<Integer> communityId) {
    if (relationTypes == null || relationTypes.isEmpty()) {
      log.warn("No relation types requested, returning empty list");
      return Collections.emptyList();
    }

    if (communityId.isPresent()) {
      return authorRepository.findAuthorRelationsWithinCommunity(relationTypes, communityId.get());
    } else {
      return graphRepository.findAllRelations().stream()
          .filter(link -> relationTypes.contains(link.relation()))
          .filter(link -> nodeIds.contains(link.source()) && nodeIds.contains(link.target()))
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

  public List<NodeDto> getShortestPath(ShortestPathRequest request) {
    Set<RelationType> relationTypes =
        request.relationTypes().isEmpty()
            ? new HashSet<>(Arrays.asList(RelationType.values()))
            : request.relationTypes();
    Set<NodeType> nodeTypes =
        request.nodeTypes().isEmpty()
            ? new HashSet<>(Arrays.asList(NodeType.values()))
            : request.nodeTypes();
    MetricConfig metricConfig =
        new MetricConfig(MetricType.SHORTEST_PATH, nodeTypes, relationTypes, Orientation.NATURAL);
    String graphName = "shortest-path";

    return metricComputationService.computeShortestPath(
        graphName, metricConfig, request.source(), request.target());
  }

  public List<LinkDto> getBridges(BridgesRequest request) {
    Set<RelationType> relationTypes =
        request.relationTypes().isEmpty()
            ? new HashSet<>(Arrays.asList(RelationType.values()))
            : request.relationTypes();
    Set<NodeType> nodeTypes =
        request.nodeTypes().isEmpty()
            ? new HashSet<>(Arrays.asList(NodeType.values()))
            : request.nodeTypes();
    MetricConfig metricConfig =
        new MetricConfig(MetricType.BRIDGES, nodeTypes, relationTypes, Orientation.UNDIRECTED);
    String graphName = "bridges";

    return metricComputationService.computeFindBridges(graphName, metricConfig);
  }
}
