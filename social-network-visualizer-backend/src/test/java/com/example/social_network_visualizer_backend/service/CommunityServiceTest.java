package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.community.CommunityOverview;
import com.example.social_network_visualizer_backend.dto.community.CommunitySummary;
import com.example.social_network_visualizer_backend.dto.community.SizeCount;
import com.example.social_network_visualizer_backend.enums.MetricType;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.Orientation;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.repository.CommunityRepository;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

  @Mock private CommunityRepository communityRepository;

  @Mock private ProjectRepository projectRepository;

  @InjectMocks private CommunityService communityService;

  @Test
  void testListAllCommunities_Success() {
    // Arrange
    CommunitySummary community1 =
        new CommunitySummary(
            1,
            100,
            "user1",
            0.85,
            Arrays.asList("hashtag1", "hashtag2"),
            Arrays.asList(new ActivityPoint(LocalDate.now(), 50)));
    CommunitySummary community2 =
        new CommunitySummary(
            2,
            200,
            "user2",
            0.75,
            Arrays.asList("hashtag3", "hashtag4"),
            Arrays.asList(new ActivityPoint(LocalDate.now(), 100)));
    List<CommunitySummary> expectedCommunities = Arrays.asList(community1, community2);
    when(communityRepository.findAllCommunitySummaries()).thenReturn(expectedCommunities);

    // Act
    List<CommunitySummary> result = communityService.listAllCommunities();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(1, result.get(0).communityId());
    assertEquals(100, result.get(0).memberCount());
    assertEquals("user1", result.get(0).topAuthor());
    verify(communityRepository).findAllCommunitySummaries();
  }

  @Test
  void testListAllCommunities_EmptyList() {
    // Arrange
    when(communityRepository.findAllCommunitySummaries()).thenReturn(Collections.emptyList());

    // Act
    List<CommunitySummary> result = communityService.listAllCommunities();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(communityRepository).findAllCommunitySummaries();
  }

  @Test
  void testListCommunities_WithPagination() {
    // Arrange
    int page = 0;
    int size = 10;
    CommunitySummary community =
        new CommunitySummary(
            1,
            100,
            "user1",
            0.85,
            Arrays.asList("hashtag1"),
            Arrays.asList(new ActivityPoint(LocalDate.now(), 50)));
    List<CommunitySummary> expectedCommunities = Arrays.asList(community);
    when(communityRepository.findPagedCommunitySummaries(page, size))
        .thenReturn(expectedCommunities);

    // Act
    List<CommunitySummary> result = communityService.listCommunities(page, size);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1, result.get(0).communityId());
    verify(communityRepository).findPagedCommunitySummaries(page, size);
  }

  @Test
  void testListCommunities_SecondPage() {
    // Arrange
    int page = 1;
    int size = 10;
    CommunitySummary community =
        new CommunitySummary(
            2,
            150,
            "user2",
            0.75,
            Arrays.asList("hashtag2"),
            Arrays.asList(new ActivityPoint(LocalDate.now(), 75)));
    List<CommunitySummary> expectedCommunities = Arrays.asList(community);
    when(communityRepository.findPagedCommunitySummaries(page, size))
        .thenReturn(expectedCommunities);

    // Act
    List<CommunitySummary> result = communityService.listCommunities(page, size);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(2, result.get(0).communityId());
    verify(communityRepository).findPagedCommunitySummaries(page, size);
  }

  @Test
  void testListCommunities_EmptyPage() {
    // Arrange
    int page = 5;
    int size = 10;
    when(communityRepository.findPagedCommunitySummaries(page, size))
        .thenReturn(Collections.emptyList());

    // Act
    List<CommunitySummary> result = communityService.listCommunities(page, size);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(communityRepository).findPagedCommunitySummaries(page, size);
  }

  @Test
  void testGetTopCommunityIds_Success() {
    // Arrange
    int limit = 5;
    List<Integer> expectedIds = Arrays.asList(1, 2, 3, 4, 5);
    when(communityRepository.findTopCommunityIds(limit)).thenReturn(expectedIds);

    // Act
    List<Integer> result = communityService.getTopCommunityIds(limit);

    // Assert
    assertNotNull(result);
    assertEquals(5, result.size());
    assertEquals(1, result.get(0));
    assertEquals(5, result.get(4));
    verify(communityRepository).findTopCommunityIds(limit);
  }

  @Test
  void testGetTopCommunityIds_LimitOne() {
    // Arrange
    int limit = 1;
    List<Integer> expectedIds = Arrays.asList(1);
    when(communityRepository.findTopCommunityIds(limit)).thenReturn(expectedIds);

    // Act
    List<Integer> result = communityService.getTopCommunityIds(limit);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(1, result.get(0));
    verify(communityRepository).findTopCommunityIds(limit);
  }

  @Test
  void testGetTopCommunityIds_EmptyResult() {
    // Arrange
    int limit = 10;
    when(communityRepository.findTopCommunityIds(limit)).thenReturn(Collections.emptyList());

    // Act
    List<Integer> result = communityService.getTopCommunityIds(limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(communityRepository).findTopCommunityIds(limit);
  }

  @Test
  void testGetCommunityOverview_Success() {
    // Arrange
    SizeCount sizeCount1 = new SizeCount(10, 5);
    SizeCount sizeCount2 = new SizeCount(20, 3);
    CommunityOverview expectedOverview =
        new CommunityOverview(
            5.5,
            10000L,
            50,
            5,
            200,
            45.5,
            10.0,
            25.0,
            50.0,
            75.0,
            90.0,
            Arrays.asList(sizeCount1, sizeCount2),
            100.5,
            500L);
    when(communityRepository.getCommunityOverview()).thenReturn(expectedOverview);

    // Act
    CommunityOverview result = communityService.getCommunityOverview();

    // Assert
    assertNotNull(result);
    assertEquals(5.5, result.avgHashtagsPerAuthor());
    assertEquals(10000L, result.totalTweets());
    assertEquals(50, result.totalCommunities());
    assertEquals(5, result.minSize());
    assertEquals(200, result.maxSize());
    assertEquals(45.5, result.avgSize());
    assertEquals(50.0, result.median());
    assertEquals(2, result.sizeHistogram().size());
    verify(communityRepository).getCommunityOverview();
  }

  @Test
  void testGetCommunityOverview_EmptyHistogram() {
    // Arrange
    CommunityOverview expectedOverview =
        new CommunityOverview(
            5.5, 10000L, 50, 5, 200, 45.5, 10.0, 25.0, 50.0, 75.0, 90.0, Collections.emptyList(),
            100.5, 500L);
    when(communityRepository.getCommunityOverview()).thenReturn(expectedOverview);

    // Act
    CommunityOverview result = communityService.getCommunityOverview();

    // Assert
    assertNotNull(result);
    assertTrue(result.sizeHistogram().isEmpty());
    verify(communityRepository).getCommunityOverview();
  }

  @Test
  void testGetCommunitySummary_Success() {
    // Arrange
    int communityId = 1;
    CommunitySummary expectedSummary =
        new CommunitySummary(
            1,
            100,
            "topUser",
            0.85,
            Arrays.asList("hashtag1", "hashtag2"),
            Arrays.asList(new ActivityPoint(LocalDate.now(), 50)));
    when(communityRepository.findCommunitySummaryById(communityId)).thenReturn(expectedSummary);

    // Act
    CommunitySummary result = communityService.getCommunitySummary(communityId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.communityId());
    assertEquals(100, result.memberCount());
    assertEquals("topUser", result.topAuthor());
    assertEquals(0.85, result.topPageRank());
    verify(communityRepository).findCommunitySummaryById(communityId);
  }

  @Test
  void testGetCommunitySummary_DifferentCommunity() {
    // Arrange
    int communityId = 5;
    CommunitySummary expectedSummary =
        new CommunitySummary(
            5,
            250,
            "anotherUser",
            0.92,
            Arrays.asList("hashtag3"),
            Arrays.asList(new ActivityPoint(LocalDate.now(), 125)));
    when(communityRepository.findCommunitySummaryById(communityId)).thenReturn(expectedSummary);

    // Act
    CommunitySummary result = communityService.getCommunitySummary(communityId);

    // Assert
    assertNotNull(result);
    assertEquals(5, result.communityId());
    assertEquals(250, result.memberCount());
    verify(communityRepository).findCommunitySummaryById(communityId);
  }

  @Test
  void testGetAuthorsWithCommunityId_Success() {
    // Arrange
    int communityId = 1;
    Author author1 = new Author();
    author1.setUserName("user1");
    Author author2 = new Author();
    author2.setUserName("user2");
    List<Author> expectedAuthors = Arrays.asList(author1, author2);
    when(communityRepository.findAuthorsByCommunityId(communityId)).thenReturn(expectedAuthors);

    // Act
    List<Author> result = communityService.getAuthorsWithCommunityId(communityId);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("user1", result.get(0).getUserName());
    assertEquals("user2", result.get(1).getUserName());
    verify(communityRepository).findAuthorsByCommunityId(communityId);
  }

  @Test
  void testGetAuthorsWithCommunityId_EmptyList() {
    // Arrange
    int communityId = 999;
    when(communityRepository.findAuthorsByCommunityId(communityId))
        .thenReturn(Collections.emptyList());

    // Act
    List<Author> result = communityService.getAuthorsWithCommunityId(communityId);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(communityRepository).findAuthorsByCommunityId(communityId);
  }

  @Test
  void testGetAuthorsWithCommunityId_SingleAuthor() {
    // Arrange
    int communityId = 2;
    Author author = new Author();
    author.setUserName("singleUser");
    List<Author> expectedAuthors = Arrays.asList(author);
    when(communityRepository.findAuthorsByCommunityId(communityId)).thenReturn(expectedAuthors);

    // Act
    List<Author> result = communityService.getAuthorsWithCommunityId(communityId);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("singleUser", result.get(0).getUserName());
    verify(communityRepository).findAuthorsByCommunityId(communityId);
  }

  @Test
  void testGetCommunityActivityHeatmap_Success() {
    // Arrange
    int communityId = 1;
    ActivityHeatmap heatmap1 = new ActivityHeatmap(10, 1, 100);
    ActivityHeatmap heatmap2 = new ActivityHeatmap(15, 2, 150);
    List<ActivityHeatmap> expectedHeatmap = Arrays.asList(heatmap1, heatmap2);
    when(communityRepository.getCommunityActivityHeatMap(communityId)).thenReturn(expectedHeatmap);

    // Act
    List<ActivityHeatmap> result = communityService.getCommunityActivityHeatmap(communityId);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(10, result.get(0).hour());
    assertEquals(1, result.get(0).dayOfWeek());
    assertEquals(100, result.get(0).posts());
    verify(communityRepository).getCommunityActivityHeatMap(communityId);
  }

  @Test
  void testGetCommunityActivityHeatmap_EmptyHeatmap() {
    // Arrange
    int communityId = 999;
    when(communityRepository.getCommunityActivityHeatMap(communityId))
        .thenReturn(Collections.emptyList());

    // Act
    List<ActivityHeatmap> result = communityService.getCommunityActivityHeatmap(communityId);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(communityRepository).getCommunityActivityHeatMap(communityId);
  }

  @Test
  void testGetCommunityActivityHeatmap_AllDaysAndHours() {
    // Arrange
    int communityId = 5;
    ActivityHeatmap heatmap1 = new ActivityHeatmap(23, 7, 50);
    ActivityHeatmap heatmap2 = new ActivityHeatmap(0, 1, 25);
    List<ActivityHeatmap> expectedHeatmap = Arrays.asList(heatmap1, heatmap2);
    when(communityRepository.getCommunityActivityHeatMap(communityId)).thenReturn(expectedHeatmap);

    // Act
    List<ActivityHeatmap> result = communityService.getCommunityActivityHeatmap(communityId);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(23, result.get(0).hour());
    assertEquals(7, result.get(0).dayOfWeek());
    assertEquals(0, result.get(1).hour());
    assertEquals(1, result.get(1).dayOfWeek());
    verify(communityRepository).getCommunityActivityHeatMap(communityId);
  }

  @Test
  void testGetProjectCommunityMetricConfig_Success() {
    // Arrange
    String projectName = "TestProject";
    MetricConfig communityMetric =
        new MetricConfig(
            MetricType.COMMUNITY,
            Set.of(NodeType.AUTHOR),
            Set.of(RelationType.RETWEETS),
            Orientation.NATURAL);
    MetricConfig pageRankMetric =
        new MetricConfig(
            MetricType.PAGERANK,
            Set.of(NodeType.AUTHOR),
            Set.of(RelationType.MENTIONS),
            Orientation.NATURAL);
    ProjectConfig config = new ProjectConfig(java.time.Instant.now(), Arrays.asList(communityMetric, pageRankMetric));
    Project project = Project.builder()
        .name(projectName)
        .config(config)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertTrue(result.isPresent());
    assertEquals(MetricType.COMMUNITY, result.get().type());
    assertTrue(result.get().nodeTypes().contains(NodeType.AUTHOR));
    assertTrue(result.get().relationTypes().contains(RelationType.RETWEETS));
    assertEquals(Orientation.NATURAL, result.get().orientation());
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_ProjectNotFound() {
    // Arrange
    String projectName = "NonExistentProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> communityService.getProjectCommunityMetricConfig(projectName));
    assertEquals("Project with name 'NonExistentProject' does not exist", exception.getMessage());
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_NullConfig() {
    // Arrange
    String projectName = "TestProject";
    Project project = Project.builder()
        .name(projectName)
        .config(null)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertFalse(result.isPresent());
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_NullMetrics() {
    // Arrange
    String projectName = "TestProject";
    ProjectConfig config = new ProjectConfig(java.time.Instant.now(), null);
    Project project = Project.builder()
        .name(projectName)
        .config(config)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertFalse(result.isPresent());
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_EmptyMetricsList() {
    // Arrange
    String projectName = "TestProject";
    ProjectConfig config = new ProjectConfig(java.time.Instant.now(), Collections.emptyList());
    Project project = Project.builder()
        .name(projectName)
        .config(config)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertFalse(result.isPresent());
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_NoCommunityMetric() {
    // Arrange
    String projectName = "TestProject";
    MetricConfig pageRankMetric =
        new MetricConfig(
            MetricType.PAGERANK,
            Set.of(NodeType.AUTHOR),
            Set.of(RelationType.MENTIONS),
            Orientation.NATURAL);
    ProjectConfig config = new ProjectConfig(java.time.Instant.now(), Arrays.asList(pageRankMetric));
    Project project = Project.builder()
        .name(projectName)
        .config(config)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertFalse(result.isPresent());
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_MultipleCommunityMetrics() {
    // Arrange - should return first COMMUNITY metric found
    String projectName = "TestProject";
    MetricConfig communityMetric1 =
        new MetricConfig(
            MetricType.COMMUNITY,
            Set.of(NodeType.AUTHOR),
            Set.of(RelationType.RETWEETS),
            Orientation.NATURAL);
    MetricConfig communityMetric2 =
        new MetricConfig(
            MetricType.COMMUNITY,
            Set.of(NodeType.TWEET),
            Set.of(RelationType.MENTIONS),
            Orientation.UNDIRECTED);
    ProjectConfig config = new ProjectConfig(java.time.Instant.now(), Arrays.asList(communityMetric1, communityMetric2));
    Project project = Project.builder()
        .name(projectName)
        .config(config)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertTrue(result.isPresent());
    assertEquals(MetricType.COMMUNITY, result.get().type());
    assertTrue(result.get().nodeTypes().contains(NodeType.AUTHOR));
    assertTrue(result.get().relationTypes().contains(RelationType.RETWEETS));
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectCommunityMetricConfig_WithMultipleNodeTypes() {
    // Arrange
    String projectName = "TestProject";
    MetricConfig communityMetric =
        new MetricConfig(
            MetricType.COMMUNITY,
            Set.of(NodeType.AUTHOR, NodeType.TWEET, NodeType.HASHTAG),
            Set.of(RelationType.RETWEETS, RelationType.MENTIONS),
            Orientation.UNDIRECTED);
    ProjectConfig config = new ProjectConfig(java.time.Instant.now(), Arrays.asList(communityMetric));
    Project project = Project.builder()
        .name(projectName)
        .config(config)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    Optional<MetricConfig> result = communityService.getProjectCommunityMetricConfig(projectName);

    // Assert
    assertTrue(result.isPresent());
    assertEquals(3, result.get().nodeTypes().size());
    assertEquals(2, result.get().relationTypes().size());
    assertEquals(Orientation.UNDIRECTED, result.get().orientation());
    verify(projectRepository).findByName(projectName);
  }
}

