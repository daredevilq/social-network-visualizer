package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.GraphDataDto;
import com.example.social_network_visualizer_backend.dto.request.GraphQueryRequest;
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

    @PostMapping("/data")
    public ResponseEntity<GraphDataDto> data(@RequestBody GraphQueryRequest req) {
        log.info("Fetching graph data - Project: {}, Relations: {}, CommunityId: {}", 
                req.projectName(), req.relationTypes(), req.communityId());
        
        Set<RelationType> relationsSet = req.relationTypes() == null || req.relationTypes().isEmpty()
                ? Set.of(RelationType.MENTIONS)
                : req.relationTypes();
        Optional<Integer> community = Optional.ofNullable(req.communityId());
        return ResponseEntity.ok(graphService.getGraph(relationsSet, community));
    }
    @GetMapping("/{relations}")
    public ResponseEntity<GraphDataDto> getGraphWithRelations(@PathVariable Set<RelationType> relations) {
        GraphDataDto graph = graphService.getGraph(relations, Optional.empty());
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/{relations}/community/{communityId}")
    public ResponseEntity<GraphDataDto> getCommunityGraphWithRelations(@PathVariable Set<RelationType> relations, @PathVariable Integer communityId) {
        GraphDataDto graph = graphService.getGraph(relations, Optional.ofNullable(communityId));
        return ResponseEntity.ok(graph);
    }
}
