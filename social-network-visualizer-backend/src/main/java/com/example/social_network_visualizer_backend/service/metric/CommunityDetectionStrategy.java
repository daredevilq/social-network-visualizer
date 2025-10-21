package com.example.social_network_visualizer_backend.service.metric;

import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.repository.AlgorithmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommunityDetectionStrategy implements MetricComputationStrategy {

  private final AlgorithmRepository algorithmRepository;

  @Override
  public void compute(String graphName) {
    algorithmRepository.createCommunities(graphName);
    log.info("Community detection completed successfully for graph: {}", graphName);
  }

  @Override
  public MetricType getMetricType() {
    return MetricType.COMMUNITY;
  }
}
