package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;

    public ProjectStatsDto getProjectStats() {
        return projectRepository.getProjectStats();
    }

    public List<ActivityPoint> getProjectActivity() {
        return projectRepository.getProjectActivity();
    }

    public List<HashtagFrequency> getProjectHashtagStats() {
        return projectRepository.findTopHashtags();
    }

    public List<ViralTweetDto> getViralTweetStats() {
        return projectRepository.findTheMostViralTweets();
    }

    public List<TopUsersDto> getTopMentions() {
        return projectRepository.findTopMentions();
    }

    public List<TopUsersDto> getTopAuthors() {
        return projectRepository.findTopAuthors();
    }

    public List<ActivityHeatmap> getHeatMap() {
        return projectRepository.getProjectHeatMap();
    }
}
