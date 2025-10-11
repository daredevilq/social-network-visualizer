package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final HashtagRepository hashtagRepository;
    private final TweetRepository tweetRepository;

    public ProjectStatsDto getProjectStats() {
        return projectRepository.getProjectStats();
    }

    public List<ActivityPoint> getProjectActivity() {
        return projectRepository.getProjectActivity();
    }

    public List<HashtagFrequency> getProjectHashtagStats() {
        return hashtagRepository.findTopHashtags();
    }

    public List<ViralTweetDto> getViralTweetStats() {
        return tweetRepository.findTheMostViralTweets();
    }

    public List<TopAuthorsDto> getTopMentions() {
        return projectRepository.findTopMentions();
    }

    public List<TopAuthorsDto> getTopAuthors() {
        return projectRepository.findTopAuthors();
    }

    public List<ActivityHeatmap> getHeatMap() {
        return projectRepository.getProjectHeatMap();
    }
}
