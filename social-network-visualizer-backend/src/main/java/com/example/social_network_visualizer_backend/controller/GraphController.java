package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.BridgeDto;
import com.example.social_network_visualizer_backend.dto.GraphDataDto;
import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/types")
    public ResponseEntity<List<String>> getAllGraphTypes() {
        List<String> types = graphService.getAllGraphTypes();
        return ResponseEntity.ok(types);
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
