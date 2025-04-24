package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.BridgeDto;
import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/author-mentions")
    public Map<String, Object> getAuthorMentionsGraph() {
        return graphService.getAuthorMentionsGraph();
    }

    @GetMapping("/degree-centrality")
    public Map<String, Object> getAuthorDegreeCentrality() {
        return graphService.getAuthorImportanceGraph();
    }

    @GetMapping("/bridges")
    public List<BridgeDto> getAllBridges() {
        return graphService.getAllBridges();
    }
}
