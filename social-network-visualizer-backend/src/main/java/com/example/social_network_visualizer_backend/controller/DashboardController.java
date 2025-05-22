package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/project-stats")
    public ResponseEntity<ProjectStatsDto> getProjectData() {
        return ResponseEntity.ok(dashboardService.getProjectStats());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityPoint>> getProjectActivity() {
        return ResponseEntity.ok(dashboardService.getProjectActivity());
    }

    @GetMapping("/hashtags")
    public ResponseEntity<List<HashtagFrequency>> getProjectHashtags() {
        return ResponseEntity.ok(dashboardService.getProjectHashtagStats());
    }

    @GetMapping("/viral-tweets")
    public ResponseEntity<List<ViralTweetDto>> getProjectViralTweets() {
        return ResponseEntity.ok(dashboardService.getViralTweetStats());
    }

    @GetMapping("/top-mentions")
    public ResponseEntity<List<TopUsersDto>> getProjectTopMentionsUsers() {
        return ResponseEntity.ok(dashboardService.getTopMentions());
    }

    @GetMapping("/top-authors")
    public ResponseEntity<List<TopUsersDto>> getProjectTopAuthors() {
        return ResponseEntity.ok(dashboardService.getTopAuthors());
    }

    @GetMapping("/heat-map")
    public ResponseEntity<List<ActivityHeatmap>> getProjectHeatMap() {
        return ResponseEntity.ok(dashboardService.getHeatMap());
    }
}
