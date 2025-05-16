package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.BridgeDto;
import com.example.social_network_visualizer_backend.dto.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.GraphTypeDto;
import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/types")
    public ResponseEntity<List<GraphTypeDto>> getAllGraphTypes() {
        List<GraphTypeDto> types = graphService.getAllGraphTypes();
        return ResponseEntity.ok(types);
    }

    @PostMapping("/{graphType}")
    public ResponseEntity<Map<String, String>> setGraphType(@PathVariable String graphType) {
        graphService.setGraphType(graphType);
        return ResponseEntity.ok(Map.of("message", "Graph type changed successfuly"));
    }

    @GetMapping("/{graphType}")
    public ResponseEntity<GraphDataDto> getGraph(@PathVariable String graphType) {
        GraphDataDto graph = graphService.getGraph(graphType, Optional.empty());
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/bridges")
    public List<BridgeDto> getAllBridges() {
        return graphService.getAllBridges();
    }

    @GetMapping("/{graphType}/community/{communityId}")
    public ResponseEntity<GraphDataDto> getGraph(@PathVariable String graphType, @PathVariable Integer communityId) {
        GraphDataDto graph = graphService.getGraph(graphType, Optional.ofNullable(communityId));
        return ResponseEntity.ok(graph);
    }
}
