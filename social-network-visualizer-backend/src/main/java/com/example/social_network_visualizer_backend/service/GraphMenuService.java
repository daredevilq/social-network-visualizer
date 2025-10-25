package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.repository.GraphMenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GraphMenuService {
  private final GraphMenuRepository graphMenuRepository;
  private final WorkspaceService workspaceService;

  public void getTweetAuthor(TweetNodeDto tweetNodeDto) {
    AuthorNodeDto author =
        graphMenuRepository
            .getTweetAuthor(tweetNodeDto.getId())
            .orElseThrow(
                () ->
                    new ProjectException(
                        "Author not found for tweet: " + tweetNodeDto.getId(),
                        HttpStatus.NOT_FOUND));

    workspaceService.updateWorkspaceMembership(author, true);
  }
}
