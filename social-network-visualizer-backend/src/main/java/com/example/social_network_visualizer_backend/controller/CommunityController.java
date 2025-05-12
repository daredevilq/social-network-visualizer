package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.CommunitySummary;
import com.example.social_network_visualizer_backend.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class CommunityController {
    private final CommunityService communityService;

    @GetMapping("/list")
    public ResponseEntity<List<CommunitySummary>> getAllCommunities() {
        List<CommunitySummary> communitySummaries = communityService.listAllCommunities();
        return ResponseEntity.ok(communitySummaries);
    }

    @GetMapping("/list-slow")
    public ResponseEntity<List<CommunitySummary>> getCommunities(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {

        List<CommunitySummary> slice = communityService.listCommunities(page, size);
        return ResponseEntity.ok(slice);
    }

    @GetMapping("/top-ids")
    public ResponseEntity<List<Integer>> getTopCommunityIds(
            @RequestParam(defaultValue = "10") int limit) {

        return ResponseEntity.ok(communityService.getTopCommunityIds(limit));
    }
}
