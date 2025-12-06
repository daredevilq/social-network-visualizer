package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;
import com.example.social_network_visualizer_backend.dto.ProjectStatsDto;
import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.repository.DashboardRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

  @Mock private DashboardRepository dashboardRepository;

  @Mock private HashtagRepository hashtagRepository;

  @Mock private TweetRepository tweetRepository;

  @InjectMocks private DashboardService dashboardService;

  @Test
  void testGetProjectStats_Success() {
    // Arrange
    ProjectStatsDto expectedStats =
        new ProjectStatsDto(10000L, 500L, 1000L, 50000L, 25L, 3000L);
    when(dashboardRepository.getProjectStats()).thenReturn(expectedStats);

    // Act
    ProjectStatsDto result = dashboardService.getProjectStats();

    // Assert
    assertNotNull(result);
    assertEquals(10000L, result.tweetsCount());
    assertEquals(500L, result.usersCount());
    assertEquals(1000L, result.hashtagsCount());
    assertEquals(50000L, result.relationsCount());
    assertEquals(25L, result.communitiesCount());
    assertEquals(3000L, result.retweetCount());
    verify(dashboardRepository).getProjectStats();
  }

  @Test
  void testGetProjectStats_ZeroValues() {
    // Arrange
    ProjectStatsDto expectedStats = new ProjectStatsDto(0L, 0L, 0L, 0L, 0L, 0L);
    when(dashboardRepository.getProjectStats()).thenReturn(expectedStats);

    // Act
    ProjectStatsDto result = dashboardService.getProjectStats();

    // Assert
    assertNotNull(result);
    assertEquals(0L, result.tweetsCount());
    assertEquals(0L, result.usersCount());
    verify(dashboardRepository).getProjectStats();
  }

  @Test
  void testGetProjectActivity_Success() {
    // Arrange
    ActivityPoint point1 = new ActivityPoint(LocalDate.of(2023, 11, 15), 100);
    ActivityPoint point2 = new ActivityPoint(LocalDate.of(2023, 11, 16), 150);
    List<ActivityPoint> expectedActivity = Arrays.asList(point1, point2);
    when(dashboardRepository.getProjectActivity()).thenReturn(expectedActivity);

    // Act
    List<ActivityPoint> result = dashboardService.getProjectActivity();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(LocalDate.of(2023, 11, 15), result.get(0).day());
    assertEquals(100, result.get(0).posts());
    verify(dashboardRepository).getProjectActivity();
  }

  @Test
  void testGetProjectActivity_EmptyList() {
    // Arrange
    when(dashboardRepository.getProjectActivity()).thenReturn(Collections.emptyList());

    // Act
    List<ActivityPoint> result = dashboardService.getProjectActivity();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(dashboardRepository).getProjectActivity();
  }

  @Test
  void testGetProjectActivity_SingleDay() {
    // Arrange
    ActivityPoint point = new ActivityPoint(LocalDate.of(2023, 11, 15), 500);
    when(dashboardRepository.getProjectActivity()).thenReturn(Arrays.asList(point));

    // Act
    List<ActivityPoint> result = dashboardService.getProjectActivity();

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(500, result.get(0).posts());
    verify(dashboardRepository).getProjectActivity();
  }

  @Test
  void testGetProjectHashtagStats_Success() {
    // Arrange
    HashtagFrequency hashtag1 = new HashtagFrequency("java", 500);
    HashtagFrequency hashtag2 = new HashtagFrequency("spring", 300);
    List<HashtagFrequency> expectedHashtags = Arrays.asList(hashtag1, hashtag2);
    when(hashtagRepository.findTopHashtags()).thenReturn(expectedHashtags);

    // Act
    List<HashtagFrequency> result = dashboardService.getProjectHashtagStats();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("java", result.get(0).name());
    assertEquals(500, result.get(0).frequency());
    verify(hashtagRepository).findTopHashtags();
  }

  @Test
  void testGetProjectHashtagStats_EmptyList() {
    // Arrange
    when(hashtagRepository.findTopHashtags()).thenReturn(Collections.emptyList());

    // Act
    List<HashtagFrequency> result = dashboardService.getProjectHashtagStats();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(hashtagRepository).findTopHashtags();
  }

  @Test
  void testGetViralTweetStats_Success() {
    // Arrange
    ViralTweetDto tweet1 =
        new ViralTweetDto("user1", "tweet1", "preview1", "url1", 1000, 500, 200, 1700);
    ViralTweetDto tweet2 =
        new ViralTweetDto("user2", "tweet2", "preview2", "url2", 800, 400, 150, 1350);
    List<ViralTweetDto> expectedTweets = Arrays.asList(tweet1, tweet2);
    when(tweetRepository.findTheMostViralTweets()).thenReturn(expectedTweets);

    // Act
    List<ViralTweetDto> result = dashboardService.getViralTweetStats();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("user1", result.get(0).userName());
    assertEquals(1700, result.get(0).engagementScore());
    verify(tweetRepository).findTheMostViralTweets();
  }

  @Test
  void testGetViralTweetStats_EmptyList() {
    // Arrange
    when(tweetRepository.findTheMostViralTweets()).thenReturn(Collections.emptyList());

    // Act
    List<ViralTweetDto> result = dashboardService.getViralTweetStats();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(tweetRepository).findTheMostViralTweets();
  }

  @Test
  void testGetTopMentions_Success() {
    // Arrange
    TopAuthorsDto author1 = new TopAuthorsDto("user1", 150);
    TopAuthorsDto author2 = new TopAuthorsDto("user2", 120);
    List<TopAuthorsDto> expectedAuthors = Arrays.asList(author1, author2);
    when(dashboardRepository.findTopMentions()).thenReturn(expectedAuthors);

    // Act
    List<TopAuthorsDto> result = dashboardService.getTopMentions();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("user1", result.get(0).username());
    assertEquals(150, result.get(0).count());
    verify(dashboardRepository).findTopMentions();
  }

  @Test
  void testGetTopMentions_EmptyList() {
    // Arrange
    when(dashboardRepository.findTopMentions()).thenReturn(Collections.emptyList());

    // Act
    List<TopAuthorsDto> result = dashboardService.getTopMentions();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(dashboardRepository).findTopMentions();
  }

  @Test
  void testGetTopAuthors_Success() {
    // Arrange
    TopAuthorsDto author1 = new TopAuthorsDto("author1", 500);
    TopAuthorsDto author2 = new TopAuthorsDto("author2", 400);
    TopAuthorsDto author3 = new TopAuthorsDto("author3", 300);
    List<TopAuthorsDto> expectedAuthors = Arrays.asList(author1, author2, author3);
    when(dashboardRepository.findTopAuthors()).thenReturn(expectedAuthors);

    // Act
    List<TopAuthorsDto> result = dashboardService.getTopAuthors();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals("author1", result.get(0).username());
    assertEquals(500, result.get(0).count());
    verify(dashboardRepository).findTopAuthors();
  }

  @Test
  void testGetTopAuthors_EmptyList() {
    // Arrange
    when(dashboardRepository.findTopAuthors()).thenReturn(Collections.emptyList());

    // Act
    List<TopAuthorsDto> result = dashboardService.getTopAuthors();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(dashboardRepository).findTopAuthors();
  }

  @Test
  void testGetHeatMap_Success() {
    // Arrange
    ActivityHeatmap heatmap1 = new ActivityHeatmap(10, 1, 100);
    ActivityHeatmap heatmap2 = new ActivityHeatmap(15, 2, 150);
    ActivityHeatmap heatmap3 = new ActivityHeatmap(20, 3, 200);
    List<ActivityHeatmap> expectedHeatmap = Arrays.asList(heatmap1, heatmap2, heatmap3);
    when(dashboardRepository.getProjectHeatMap()).thenReturn(expectedHeatmap);

    // Act
    List<ActivityHeatmap> result = dashboardService.getHeatMap();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals(10, result.get(0).hour());
    assertEquals(1, result.get(0).dayOfWeek());
    assertEquals(100, result.get(0).posts());
    verify(dashboardRepository).getProjectHeatMap();
  }

  @Test
  void testGetHeatMap_EmptyList() {
    // Arrange
    when(dashboardRepository.getProjectHeatMap()).thenReturn(Collections.emptyList());

    // Act
    List<ActivityHeatmap> result = dashboardService.getHeatMap();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(dashboardRepository).getProjectHeatMap();
  }

  @Test
  void testGetHeatMap_AllHoursOfDay() {
    // Arrange
    ActivityHeatmap morning = new ActivityHeatmap(8, 1, 50);
    ActivityHeatmap afternoon = new ActivityHeatmap(14, 1, 100);
    ActivityHeatmap evening = new ActivityHeatmap(20, 1, 75);
    List<ActivityHeatmap> expectedHeatmap = Arrays.asList(morning, afternoon, evening);
    when(dashboardRepository.getProjectHeatMap()).thenReturn(expectedHeatmap);

    // Act
    List<ActivityHeatmap> result = dashboardService.getHeatMap();

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals(8, result.get(0).hour());
    assertEquals(14, result.get(1).hour());
    assertEquals(20, result.get(2).hour());
    verify(dashboardRepository).getProjectHeatMap();
  }
}

