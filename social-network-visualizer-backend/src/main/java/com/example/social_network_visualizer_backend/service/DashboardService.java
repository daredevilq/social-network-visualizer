package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;
import com.example.social_network_visualizer_backend.dto.HashtagFrequency;
import com.example.social_network_visualizer_backend.dto.ProjectStatsDto;
import com.example.social_network_visualizer_backend.dto.ViralTweetDto;
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
}
