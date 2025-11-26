package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.community.CommunityOverview;
import com.example.social_network_visualizer_backend.dto.community.CommunitySummary;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.repository.CommunityRepository;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommunityService {
  private final CommunityRepository communityRepository;
  private final ProjectRepository projectRepository;

  public List<CommunitySummary> listAllCommunities() {
    return communityRepository.findAllCommunitySummaries();
  }

  public List<CommunitySummary> listCommunities(int page, int size) {
    return communityRepository.findPagedCommunitySummaries(page, size);
  }

  public List<Integer> getTopCommunityIds(int limit) {
    return communityRepository.findTopCommunityIds(limit);
  }

  public CommunityOverview getCommunityOverview() {
    return communityRepository.getCommunityOverview();
  }

  public CommunitySummary getCommunitySummary(int communityId) {
    return communityRepository.findCommunitySummaryById(communityId);
  }

  public List<Author> getAuthorsWithCommunityId(int communityId) {
    return communityRepository.findAuthorsByCommunityId(communityId);
  }

  public List<ActivityHeatmap> getCommunityActivityHeatmap(int communityId) {
    return communityRepository.getCommunityActivityHeatMap(communityId);
  }

  public Optional<MetricConfig> getProjectCommunityMetricConfig(String projectName) {
    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getConfig() == null || project.getConfig().metrics() == null) {
      log.warn("Project '{}' has no metrics configuration", projectName);
      return Optional.empty();
    }

    Optional<MetricConfig> communityMetric =
        project.getConfig().metrics().stream()
            .filter(metricConfig -> metricConfig.type().equals(MetricType.COMMUNITY))
            .findFirst();

    if (communityMetric.isEmpty()) {
      log.warn("Project '{}' has no COMMUNITY metric configuration in metrics list", projectName);
    } else {
      log.info(
          "Found COMMUNITY metric config for project '{}': nodeTypes={}, relationTypes={}, orientation={}",
          projectName,
          communityMetric.get().nodeTypes(),
          communityMetric.get().relationTypes(),
          communityMetric.get().orientation());
    }

    return communityMetric;
  }
}
