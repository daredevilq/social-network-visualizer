package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public ProjectStatsDto getProjectStats() {
        return dashboardRepository.getProjectStats();
    }

    public List<ActivityPoint> getProjectActivity() {
        return dashboardRepository.getProjectActivity();
    }

    public List<HashtagFrequency> getProjectHashtagStats() {
        return dashboardRepository.findTopHashtags();
    }

    public List<ViralTweetDto> getViralTweetStats() {
        return dashboardRepository.findTheMostViralTweets();
    }

    public List<TopUsersDto> getTopMentions() {
        return dashboardRepository.findTopMentions();
    }

    public List<TopUsersDto> getTopAuthors() {
        return dashboardRepository.findTopAuthors();
    }

    public List<ActivityHeatmap> getHeatMap() {
        return dashboardRepository.getProjectHeatMap();
    }
}
