package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.ReplyDto;
import com.example.social_network_visualizer_backend.dto.author.AuthorDto;
import com.example.social_network_visualizer_backend.dto.author.MentionDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetDto;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.ProjectFile;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.gridfs.GridFsResource;

@ExtendWith(MockitoExtension.class)
class ProjectParserTest {

  @Mock private TweetRepository tweetRepository;

  @Mock private AuthorRepository authorRepository;

  @Mock private HashtagRepository hashtagRepository;

  @Mock private TweetRelationService tweetRelationService;

  @Mock private ProjectRepository projectRepository;

  @Mock private GridFsService gridFsService;

  @InjectMocks private ProjectParser projectParser;

  @Test
  void testParseDirectory_Success() throws IOException {
    // Arrange
    String projectName = "TestProject";

    ProjectFile projectFile =
        ProjectFile.builder().filename("test.json").gridFsId("gridfs123").sizeInBytes(100).build();

    Project project =
        Project.builder()
            .name(projectName)
            .files(List.of(projectFile))
            .workspaces(Collections.emptyList())
            .build();

    String jsonContent =
        "[{\"id\":\"tweet1\",\"content\":\"test\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a1\",\"userName\":\"author1\",\"displayName\":\"Author 1\",\"name\":\"Author One\",\"foreignId\":\"foreign1\"}}]";
    byte[] jsonBytes = jsonContent.getBytes();

    GridFsResource resource = mock(GridFsResource.class);
    when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(jsonBytes));

    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));
    when(gridFsService.getFile("gridfs123")).thenReturn(resource);

    // Act
    int result = projectParser.parseDirectory(projectName);

    // Assert
    assertTrue(result >= 1);
    verify(projectRepository).findByName(projectName);
    verify(gridFsService).getFile("gridfs123");
  }

  @Test
  void testParseDirectory_ProjectNotFound() {
    // Arrange
    String projectName = "NonExistentProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(ProjectException.class, () -> projectParser.parseDirectory(projectName));
    verify(projectRepository).findByName(projectName);
    verify(gridFsService, never()).getFile(anyString());
  }

  @Test
  void testParseDirectory_NoFiles() {
    // Arrange
    String projectName = "EmptyProject";
    Project project =
        Project.builder()
            .name(projectName)
            .files(Collections.emptyList())
            .workspaces(Collections.emptyList())
            .build();

    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));

    // Act
    int result = projectParser.parseDirectory(projectName);

    // Assert
    assertEquals(0, result);
    verify(projectRepository).findByName(projectName);
    verify(gridFsService, never()).getFile(anyString());
  }

  @Test
  void testParseDirectory_GridFsFileNotFound() {
    // Arrange
    String projectName = "TestProject";

    ProjectFile projectFile =
        ProjectFile.builder()
            .filename("missing.json")
            .gridFsId("missing123")
            .sizeInBytes(100)
            .build();

    Project project =
        Project.builder()
            .name(projectName)
            .files(List.of(projectFile))
            .workspaces(Collections.emptyList())
            .build();

    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));
    when(gridFsService.getFile("missing123")).thenReturn(null);

    // Act
    int result = projectParser.parseDirectory(projectName);

    // Assert
    assertEquals(0, result);
    verify(gridFsService).getFile("missing123");
  }

  @Test
  void testParseDirectory_IOExceptionWhileReadingFile() throws IOException {
    // Arrange
    String projectName = "TestProject";

    ProjectFile projectFile =
        ProjectFile.builder().filename("error.json").gridFsId("error123").sizeInBytes(100).build();

    Project project =
        Project.builder()
            .name(projectName)
            .files(List.of(projectFile))
            .workspaces(Collections.emptyList())
            .build();

    GridFsResource resource = mock(GridFsResource.class);
    when(resource.getInputStream()).thenThrow(new IOException("Read error"));

    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));
    when(gridFsService.getFile("error123")).thenReturn(resource);

    // Act & Assert
    assertThrows(ProjectException.class, () -> projectParser.parseDirectory(projectName));
    verify(gridFsService).getFile("error123");
  }

  @Test
  void testImportFilesToDatabase_CreateAllNodes() throws Exception {
    // Arrange
    String jsonContent =
        "[{\"id\":\"tweet1\",\"content\":\"test\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a1\",\"userName\":\"author1\",\"displayName\":\"Author 1\",\"name\":\"Author One\",\"foreignId\":\"foreign1\"}}]";
    byte[] jsonBytes = jsonContent.getBytes();
    List<byte[]> jsonFiles = List.of(jsonBytes);

    // Act
    int result = projectParser.importFilesToDatabase(jsonFiles, true);

    // Assert
    assertTrue(result >= 1);
    verify(tweetRepository).createAll(anyList());
    verify(authorRepository).createAll(anyList());
    verify(hashtagRepository).createAll(anyList());
    verify(tweetRelationService).createAuthorTweetRelations(anyMap());
  }

  @Test
  void testImportFilesToDatabase_MergeNodes() throws Exception {
    // Arrange
    String jsonContent =
        "[{\"id\":\"tweet1\",\"content\":\"test\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a1\",\"userName\":\"author1\",\"displayName\":\"Author 1\",\"name\":\"Author One\",\"foreignId\":\"foreign1\"}}]";
    byte[] jsonBytes = jsonContent.getBytes();
    List<byte[]> jsonFiles = List.of(jsonBytes);

    // Act
    int result = projectParser.importFilesToDatabase(jsonFiles, false);

    // Assert
    assertTrue(result >= 1);
    verify(tweetRepository).mergeAll(anyList());
    verify(authorRepository).mergeAll(anyList());
    verify(hashtagRepository).mergeAll(anyList());
  }

  @Test
  void testImportFilesToDatabase_EmptyFileList() {
    // Arrange
    List<byte[]> jsonFiles = Collections.emptyList();

    // Act
    int result = projectParser.importFilesToDatabase(jsonFiles, true);

    // Assert
    assertEquals(0, result);
    verify(tweetRepository).createAll(anyList());
  }

  @Test
  void testImportFilesToDatabase_InvalidJson() {
    // Arrange
    byte[] invalidJson = "invalid json".getBytes();
    List<byte[]> jsonFiles = List.of(invalidJson);

    // Act
    int result = projectParser.importFilesToDatabase(jsonFiles, true);

    // Assert
    assertEquals(0, result);
  }

  @Test
  void testBuildNodes_WithHashtags() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();
    TweetDto tweet = createSimpleTweet("tweet1", "author1");
    tweet.setHashtags(List.of("java", "spring"));
    tweets.add(tweet);

    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    assertEquals(1, tweetsMap.size());
    verify(hashtagRepository).createAll(anyList());

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(hashtagRepository).createAll(captor.capture());
    List<Map<String, Object>> hashtagsData = captor.getValue();
    assertEquals(2, hashtagsData.size());
  }

  @Test
  void testBuildNodes_WithReplies() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();
    TweetDto tweet = createSimpleTweet("tweet1", "author1");

    ReplyDto reply = new ReplyDto();
    reply.setUsername("replyUser");
    reply.setUserId("replyId");
    tweet.setReplies(List.of(reply));

    tweets.add(tweet);
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    verify(authorRepository).createAll(anyList());

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(authorRepository).createAll(captor.capture());
    List<Map<String, Object>> authorsData = captor.getValue();
    assertEquals(2, authorsData.size());
  }

  @Test
  void testBuildNodes_WithMentions() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();
    TweetDto tweet = createSimpleTweet("tweet1", "author1");

    MentionDto mention = new MentionDto();
    mention.setUsername("mentionedUser");
    mention.setUserId("mentionId");
    tweet.setMentions(List.of(mention));

    tweets.add(tweet);
    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    verify(authorRepository).createAll(anyList());

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(authorRepository).createAll(captor.capture());
    List<Map<String, Object>> authorsData = captor.getValue();
    assertEquals(2, authorsData.size());
  }

  @Test
  void testBuildNodes_SkipsDuplicateTweets() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();
    TweetDto tweet1 = createSimpleTweet("tweet1", "author1");
    TweetDto tweet2 = createSimpleTweet("tweet1", "author1");
    tweets.add(tweet1);
    tweets.add(tweet2);

    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    assertEquals(1, tweetsMap.size());

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(tweetRepository).createAll(captor.capture());
    List<Map<String, Object>> tweetsData = captor.getValue();
    assertEquals(1, tweetsData.size());
  }

  @Test
  void testBuildNodes_SkipsTweetWithNullAuthor() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();
    TweetDto tweet = new TweetDto();
    tweet.setId("tweet1");
    tweet.setAuthor(null);
    tweet.setContent("content");
    tweet.setObjectCreatedAt(new Date());
    tweet.setPublicationDate(new Date());
    tweets.add(tweet);

    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    assertEquals(0, tweetsMap.size());

    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(tweetRepository).createAll(captor.capture());
    List<Map<String, Object>> tweetsData = captor.getValue();
    assertEquals(0, tweetsData.size());
  }

  @Test
  void testBuildNodes_DeduplicatesAuthors() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();
    tweets.add(createSimpleTweet("tweet1", "sameAuthor"));
    tweets.add(createSimpleTweet("tweet2", "sameAuthor"));
    tweets.add(createSimpleTweet("tweet3", "differentAuthor"));

    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(authorRepository).createAll(captor.capture());
    List<Map<String, Object>> authorsData = captor.getValue();
    assertEquals(2, authorsData.size());
  }

  @Test
  void testBuildNodes_DeduplicatesHashtags() throws Exception {
    // Arrange
    List<TweetDto> tweets = new ArrayList<>();

    TweetDto tweet1 = createSimpleTweet("tweet1", "author1");
    tweet1.setHashtags(List.of("java", "spring"));

    TweetDto tweet2 = createSimpleTweet("tweet2", "author2");
    tweet2.setHashtags(List.of("java", "kotlin"));

    tweets.add(tweet1);
    tweets.add(tweet2);

    Map<String, TweetDto> tweetsMap = new HashMap<>();

    // Act
    projectParser.buildNodes(tweets, tweetsMap, true);

    // Assert
    ArgumentCaptor<List<Map<String, Object>>> captor = ArgumentCaptor.forClass(List.class);
    verify(hashtagRepository).createAll(captor.capture());
    List<Map<String, Object>> hashtagsData = captor.getValue();
    assertEquals(3, hashtagsData.size());
  }

  @Test
  void testCreateRelationships_CallsAllRelationServices() {
    // Arrange
    Map<String, TweetDto> tweetsMap = new HashMap<>();
    tweetsMap.put("tweet1", createSimpleTweet("tweet1", "author1"));

    // Act
    projectParser.createRelationships(tweetsMap);

    // Assert
    verify(tweetRelationService).createAuthorTweetRelations(tweetsMap);
    verify(tweetRelationService).createTweetMentionsRelations(tweetsMap);
    verify(tweetRelationService).createTweetRepliesRelations(tweetsMap);
    verify(tweetRelationService).createTweetParentRelations(tweetsMap);
    verify(tweetRelationService).createTweetHashtagRelations(tweetsMap);
  }

  @Test
  void testImportFilesToDatabase_WithTweetParents() throws Exception {
    // Arrange
    String jsonContent =
        "[{\"id\":\"child1\",\"content\":\"reply\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a2\",\"userName\":\"author2\",\"displayName\":\"Author 2\",\"name\":\"Author Two\",\"foreignId\":\"foreign2\"},\"parent\":{\"id\":\"parent1\",\"content\":\"original\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a1\",\"userName\":\"author1\",\"displayName\":\"Author 1\",\"name\":\"Author One\",\"foreignId\":\"foreign1\"}}}]";
    byte[] jsonBytes = jsonContent.getBytes();
    List<byte[]> jsonFiles = List.of(jsonBytes);

    // Act
    int result = projectParser.importFilesToDatabase(jsonFiles, true);

    // Assert
    assertTrue(result >= 2);
  }

  @Test
  void testImportFilesToDatabase_WithNestedParents() throws Exception {
    // Arrange
    String jsonContent =
        "[{\"id\":\"child\",\"content\":\"reply2\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a3\",\"userName\":\"author3\",\"displayName\":\"Author 3\",\"name\":\"Author Three\",\"foreignId\":\"foreign3\"},\"parent\":{\"id\":\"parent\",\"content\":\"reply1\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a2\",\"userName\":\"author2\",\"displayName\":\"Author 2\",\"name\":\"Author Two\",\"foreignId\":\"foreign2\"},\"parent\":{\"id\":\"gp\",\"content\":\"original\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a1\",\"userName\":\"author1\",\"displayName\":\"Author 1\",\"name\":\"Author One\",\"foreignId\":\"foreign1\"}}}}]";
    byte[] jsonBytes = jsonContent.getBytes();
    List<byte[]> jsonFiles = List.of(jsonBytes);

    // Act
    int result = projectParser.importFilesToDatabase(jsonFiles, true);

    // Assert
    assertTrue(result >= 3);
  }

  @Test
  void testParseDirectory_MultipleFiles() throws IOException {
    // Arrange
    String projectName = "MultiFileProject";

    ProjectFile file1 =
        ProjectFile.builder().filename("file1.json").gridFsId("gridfs1").sizeInBytes(100).build();

    ProjectFile file2 =
        ProjectFile.builder().filename("file2.json").gridFsId("gridfs2").sizeInBytes(200).build();

    Project project =
        Project.builder()
            .name(projectName)
            .files(List.of(file1, file2))
            .workspaces(Collections.emptyList())
            .build();

    String json1Content =
        "[{\"id\":\"tweet1\",\"content\":\"test1\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a1\",\"userName\":\"author1\",\"displayName\":\"Author 1\",\"name\":\"Author One\",\"foreignId\":\"foreign1\"}}]";
    String json2Content =
        "[{\"id\":\"tweet2\",\"content\":\"test2\",\"objectCreatedAt\":\"2023-01-01T00:00:00.000Z\",\"publicationDate\":\"2023-01-01T00:00:00.000Z\",\"author\":{\"id\":\"a2\",\"userName\":\"author2\",\"displayName\":\"Author 2\",\"name\":\"Author Two\",\"foreignId\":\"foreign2\"}}]";

    byte[] json1 = json1Content.getBytes();
    byte[] json2 = json2Content.getBytes();

    GridFsResource resource1 = mock(GridFsResource.class);
    GridFsResource resource2 = mock(GridFsResource.class);
    when(resource1.getInputStream()).thenReturn(new ByteArrayInputStream(json1));
    when(resource2.getInputStream()).thenReturn(new ByteArrayInputStream(json2));

    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(project));
    when(gridFsService.getFile("gridfs1")).thenReturn(resource1);
    when(gridFsService.getFile("gridfs2")).thenReturn(resource2);

    // Act
    int result = projectParser.parseDirectory(projectName);

    // Assert
    assertTrue(result >= 2);
    verify(gridFsService).getFile("gridfs1");
    verify(gridFsService).getFile("gridfs2");
  }

  private TweetDto createSimpleTweet(String tweetId, String authorName) {
    TweetDto tweet = new TweetDto();
    tweet.setId(tweetId);
    tweet.setContent("Test content for " + tweetId);
    tweet.setObjectCreatedAt(new Date());
    tweet.setPublicationDate(new Date());

    AuthorDto author = new AuthorDto();
    author.setId(authorName + "_id");
    author.setUserName(authorName);
    author.setDisplayName(authorName + " Display");
    author.setName(authorName);
    author.setForeignId(authorName + "_foreign");

    tweet.setAuthor(author);
    return tweet;
  }
}
