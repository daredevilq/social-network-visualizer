package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.repository.GraphMenuRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class GraphMenuService {
  private GraphMenuRepository graphMenuRepository;

  public void addAuthorsLatestTweets(String authorId, int numberOfTweets) {
    graphMenuRepository.addAuthorsLatestTweetsToWorkspace(authorId, numberOfTweets);
  }
}
