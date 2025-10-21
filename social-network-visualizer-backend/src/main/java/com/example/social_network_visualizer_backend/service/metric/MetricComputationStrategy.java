package com.example.social_network_visualizer_backend.service.metric;

import com.example.social_network_visualizer_backend.enums.MetricType;

public interface MetricComputationStrategy {

  void compute(String graphName);

  MetricType getMetricType();
}
