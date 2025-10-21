package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.repository.GraphRepository;
import com.example.social_network_visualizer_backend.service.metric.MetricComputationStrategy;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MetricComputationService {

  private final GraphRepository graphRepository;
  private final List<MetricComputationStrategy> strategies;

  public void computeMetrics(String projectName, ProjectConfig config) {
    if (config == null || config.metrics() == null || config.metrics().isEmpty()) {
      log.warn("No metrics defined in project config for: {}", projectName);
      return;
    }

    for (MetricConfig metricCfg : config.metrics()) {
      computeSingleMetric(projectName, metricCfg);
    }

    log.info("All metrics computed successfully for project: {}", projectName);
  }

  private void computeSingleMetric(String projectName, MetricConfig metricCfg) {
    String tempGraphName = generateGraphName(projectName, metricCfg.type());

    log.info(
        "Processing metric: {} - Graph: {}, Orientation: {}, NodeTypes: {}, Relations: {}",
        metricCfg.type(),
        tempGraphName,
        metricCfg.orientation(),
        metricCfg.nodeLabels(),
        metricCfg.relationTypes());

    try {
      createGraphProjection(tempGraphName, metricCfg);
      MetricComputationStrategy strategy = findStrategy(metricCfg.type());
      strategy.compute(tempGraphName);

    } catch (Exception e) {
      log.error(
          "Failed to compute metric {} for graph {}: {}",
          metricCfg.type(),
          tempGraphName,
          e.getMessage(),
          e);
      throw new RuntimeException("Failed to compute metric: " + metricCfg.type(), e);
    } finally {
      graphRepository.dropGdsGraph(tempGraphName);
    }
  }

  private void createGraphProjection(String graphName, MetricConfig metricCfg) {
    List<String> labels = metricCfg.nodeLabels().stream().map(NodeType::getLabel).toList();

    Map<String, Map<String, String>> relations =
        toGdsRelationMap(metricCfg.relationTypes(), metricCfg.orientation());

    graphRepository.createGraph(graphName, labels, relations);
    log.debug("In-memory graph projection created: {}", graphName);
  }

  private MetricComputationStrategy findStrategy(MetricType metricType) {
    return strategies.stream()
        .filter(s -> s.getMetricType() == metricType)
        .findFirst()
        .orElseThrow(
            () -> new IllegalStateException("No strategy found for metric type: " + metricType));
  }

  private String generateGraphName(String projectName, MetricType metricType) {
    return "g_%s_%s"
        .formatted(
            projectName.toLowerCase().replaceAll("[^a-z0-9]", "_"),
            metricType.name().toLowerCase());
  }

  private Map<String, Map<String, String>> toGdsRelationMap(
      Iterable<RelationType> relationTypes, Orientation orientation) {

    String orientationValue =
        switch (orientation) {
          case NATURAL -> "NATURAL";
          case UNDIRECTED -> "UNDIRECTED";
        };

    return java.util.stream.StreamSupport.stream(relationTypes.spliterator(), false)
        .collect(
            Collectors.toMap(
                RelationType::name,
                rt -> Map.of("type", rt.name(), "orientation", orientationValue)));
  }
}
