package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/author-mentions")
    public Map<String, Object> getAuthorMentionsGraph() {
        return graphService.getAuthorMentionsGraph();
    }
}
