package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.config.ProjectConfigDto;
import com.example.social_network_visualizer_backend.enums.NodeLabel;
import com.example.social_network_visualizer_backend.enums.RelationType;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.Map;

@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class MetaConfigController {

    @GetMapping("/relation-types")
    public EnumSet<RelationType> relationTypes() {
        return EnumSet.allOf(RelationType.class);
    }

    @GetMapping("/node-labels")
    public EnumSet<NodeLabel> nodeLabels() {
        return EnumSet.allOf(NodeLabel.class);
    }

    @GetMapping("/metric-types")
    public EnumSet<ProjectConfigDto.MetricType> metricTypes() {
        return EnumSet.allOf(ProjectConfigDto.MetricType.class);
    }

    @GetMapping("/orientations")
    public EnumSet<ProjectConfigDto.Orientation> orientations() {
        return EnumSet.allOf(ProjectConfigDto.Orientation.class);
    }

    @GetMapping("/meta")
    public Map<String, Object> meta() {
        return Map.of(
                "orientations", Arrays.stream(ProjectConfigDto.Orientation.values()).map(Enum::name).toList(),
                "metricTypes", Arrays.stream(ProjectConfigDto.MetricType.values()).map(Enum::name).toList(),
                "relationTypes", Arrays.stream(RelationType.values()).map(Enum::name).toList(),
                "nodeLabels", Arrays.stream(NodeLabel.values()).map(Enum::name).toList()
        );
    }

}
