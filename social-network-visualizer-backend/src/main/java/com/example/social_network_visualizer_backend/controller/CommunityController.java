package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.community.CommunityOverview;
import com.example.social_network_visualizer_backend.dto.community.CommunitySummary;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/overview")
    public ResponseEntity<CommunityOverview> getCommunityOverview(){
        return ResponseEntity.ok(communityService.getCommunityOverview());
    }

    @GetMapping("/summary/{communityId}")
    public ResponseEntity<CommunitySummary> getCommunitySummaryById(
            @PathVariable("communityId") int communityId) {
        CommunitySummary summary = communityService.getCommunitySummary(communityId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{communityId}/authors")
    public ResponseEntity<List<Author>> getAuthorsWithGivenCommunityId(
            @PathVariable("communityId") int communityId) {
        List<Author> authors = communityService.getAuthorsWithCommunityId(communityId);
        return ResponseEntity.ok(authors);
    }

    @GetMapping("/{communityId}/heatmap")
    public ResponseEntity<List<ActivityHeatmap>> getCommunityActivityHeatMap(
            @PathVariable("communityId") int communityId) {
        List<ActivityHeatmap> results = communityService.getCommunityActivityHeatmap(communityId);
        return ResponseEntity.ok(results);
    }

}
