package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.config.MetricConfigDto;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeLabel;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Map;

@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class MetaConfigController {

    private final ObjectMapper objectMapper;

    @Value("classpath:defaultMetrics.json")
    private Resource defaultMetricsResource;

    @GetMapping("/relation-types")
    public EnumSet<RelationType> relationTypes() {
        return EnumSet.allOf(RelationType.class);
    }

    @GetMapping("/node-labels")
    public EnumSet<NodeLabel> nodeLabels() {
        return EnumSet.allOf(NodeLabel.class);
    }

    @GetMapping("/metric-types")
    public EnumSet<MetricType> metricTypes() {
        return EnumSet.allOf(MetricType.class);
    }

    @GetMapping("/orientations")
    public EnumSet<Orientation> orientations() {
        return EnumSet.allOf(Orientation.class);
    }

    @GetMapping("/default")
    public MetricConfigDto[] getDefaultMetricConfigs() throws IOException {
        try (var is = defaultMetricsResource.getInputStream()) {
            return objectMapper.readValue(is, MetricConfigDto[].class);
        }
    }

    @GetMapping("/meta")
    public Map<String, Object> meta() {
        return Map.of(
                "orientations", Arrays.stream(Orientation.values()).map(Enum::name).toList(),
                "metricTypes", Arrays.stream(MetricType.values()).map(Enum::name).toList(),
                "relationTypes", Arrays.stream(RelationType.values()).map(Enum::name).toList(),
                "nodeLabels", Arrays.stream(NodeLabel.values()).map(Enum::name).toList()
        );
    }

}
