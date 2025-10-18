package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.graph.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @PostMapping
    public ResponseEntity<GraphDataDto> getGraph(@RequestBody GraphQueryRequest request) {
        GraphDataDto graph = graphService.getGraph(request, Optional.empty());
        return ResponseEntity.ok(graph);
    }

    @PostMapping("/community/{communityId}")
    public ResponseEntity<GraphDataDto> getGraphByCommunity(
            @PathVariable Integer communityId,
            @RequestBody GraphQueryRequest request) {
        GraphDataDto graph = graphService.getGraph(request, Optional.of(communityId));
        return ResponseEntity.ok(graph);
    }
}
