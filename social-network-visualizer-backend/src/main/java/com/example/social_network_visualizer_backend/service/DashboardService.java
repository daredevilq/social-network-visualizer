package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.repository.DashboardRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private final DashboardRepository dashboardRepository;
  private final HashtagRepository hashtagRepository;
  private final TweetRepository tweetRepository;

  public ProjectStatsDto getProjectStats() {
    return dashboardRepository.getProjectStats();
  }

  public List<ActivityPoint> getProjectActivity() {
    return dashboardRepository.getProjectActivity();
  }

  public List<HashtagFrequency> getProjectHashtagStats() {
    return hashtagRepository.findTopHashtags();
  }

  public List<ViralTweetDto> getViralTweetStats() {
    return tweetRepository.findTheMostViralTweets();
  }

  public List<TopAuthorsDto> getTopMentions() {
    return dashboardRepository.findTopMentions();
  }

  public List<TopAuthorsDto> getTopAuthors() {
    return dashboardRepository.findTopAuthors();
  }

  public List<ActivityHeatmap> getHeatMap() {
    return dashboardRepository.getProjectHeatMap();
  }
}
