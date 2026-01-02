package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.dto.workspace.WorkspaceImportResult;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.exceptions.WorkspaceException;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.Hashtag;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.Workspace;
import com.example.social_network_visualizer_backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class WorkspaceServiceTest {

  @Mock private ProjectRepository projectRepository;
  @Mock private GraphRepository graphRepository;
  @Mock private AuthorRepository authorRepository;
  @Mock private TweetRepository tweetRepository;
  @Mock private HashtagRepository hashtagRepository;
  @Mock private ObjectMapper objectMapper;

  @InjectMocks private WorkspaceService workspaceService;

  private Project testProject;
  private Workspace testWorkspace;
  private AuthorNodeDto authorNode;
  private TweetNodeDto tweetNode;
  private HashtagNodeDto hashtagNode;
  private LinkDto testLink;

  @BeforeEach
  void setUp() {
    authorNode = new AuthorNodeDto(null, null);
    authorNode.setId("author1");
    authorNode.setName("author1");
    authorNode.setNodeType(NodeType.AUTHOR);

    tweetNode = new TweetNodeDto(null, null, null, null, null, null, null, null, null);
    tweetNode.setId("tweet1");
    tweetNode.setNodeType(NodeType.TWEET);

    hashtagNode = new HashtagNodeDto();
    hashtagNode.setId("hashtag1");
    hashtagNode.setName("hashtag1");
    hashtagNode.setNodeType(NodeType.HASHTAG);

    testLink = new LinkDto("author1", "tweet1", RelationType.POSTED, 1);

    testWorkspace =
        Workspace.builder()
            .name("testWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode, tweetNode)))
            .edges(new ArrayList<>(List.of(testLink)))
            .build();

    testProject =
        Project.builder()
            .name("testProject")
            .workspaces(new ArrayList<>(List.of(testWorkspace)))
            .build();
  }

  @Test
  void testGetAllWorkspaces_Success() {
    // Arrange
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act
    List<String> result = workspaceService.getAllWorkspaces("testProject");

    // Assert
    assertEquals(1, result.size());
    assertEquals("testWorkspace", result.get(0));
    verify(projectRepository).findByName("testProject");
  }

  @Test
  void testGetAllWorkspaces_ProjectNotFound() {
    // Arrange
    when(projectRepository.findByName("nonExistent")).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class, () -> workspaceService.getAllWorkspaces("nonExistent"));
    assertEquals("Project with name 'nonExistent' does not exist", exception.getMessage());
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
  }

  @Test
  void testGetAllWorkspaces_NoWorkspaces() {
    // Arrange
    Project projectWithNoWorkspaces =
        Project.builder().name("testProject").workspaces(new ArrayList<>()).build();
    when(projectRepository.findByName("testProject"))
        .thenReturn(Optional.of(projectWithNoWorkspaces));

    // Act
    List<String> result = workspaceService.getAllWorkspaces("testProject");

    // Assert
    assertTrue(result.isEmpty());
  }

  @Test
  void testGetAllWorkspaces_NullWorkspaces() {
    // Arrange
    Project projectWithNullWorkspaces =
        Project.builder().name("testProject").workspaces(null).build();
    when(projectRepository.findByName("testProject"))
        .thenReturn(Optional.of(projectWithNullWorkspaces));

    // Act
    List<String> result = workspaceService.getAllWorkspaces("testProject");

    // Assert
    assertTrue(result.isEmpty());
  }

  @Test
  void testSaveWorkspace_NewWorkspace() {
    // Arrange
    Workspace newWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>())
            .edges(new ArrayList<>())
            .build();
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    workspaceService.saveWorkspace("testProject", newWorkspace);

    // Assert
    assertEquals(2, testProject.getWorkspaces().size());
    assertTrue(
        testProject.getWorkspaces().stream().anyMatch(w -> "newWorkspace".equals(w.getName())));
    verify(projectRepository).save(testProject);
  }

  @Test
  void testSaveWorkspace_UpdateExisting() {
    // Arrange
    Workspace updatedWorkspace =
        Workspace.builder()
            .name("testWorkspace")
            .nodes(new ArrayList<>(List.of(hashtagNode)))
            .edges(new ArrayList<>())
            .build();
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    workspaceService.saveWorkspace("testProject", updatedWorkspace);

    // Assert
    assertEquals(1, testProject.getWorkspaces().size());
    assertEquals(1, testProject.getWorkspaces().get(0).getNodes().size());
    assertEquals("hashtag1", testProject.getWorkspaces().get(0).getNodes().get(0).getId());
    verify(projectRepository).save(testProject);
  }

  @Test
  void testSaveWorkspace_NullWorkspaceName() {
    // Arrange
    Workspace workspaceWithNullName =
        Workspace.builder().name(null).nodes(new ArrayList<>()).build();

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.saveWorkspace("testProject", workspaceWithNullName));
    assertEquals("Workspace name cannot be null or empty", exception.getMessage());
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
  }

  @Test
  void testSaveWorkspace_BlankWorkspaceName() {
    // Arrange
    Workspace workspaceWithBlankName =
        Workspace.builder().name("   ").nodes(new ArrayList<>()).build();

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.saveWorkspace("testProject", workspaceWithBlankName));
    assertEquals("Workspace name cannot be null or empty", exception.getMessage());
  }

  @Test
  void testSaveWorkspace_ProjectNotFound() {
    // Arrange
    when(projectRepository.findByName("nonExistent")).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.saveWorkspace("nonExistent", testWorkspace));
    assertEquals("Project with name 'nonExistent' does not exist", exception.getMessage());
  }

  @Test
  void testSaveWorkspace_NullWorkspacesInProject() {
    // Arrange
    Project projectWithNullWorkspaces =
        Project.builder().name("testProject").workspaces(null).build();
    when(projectRepository.findByName("testProject"))
        .thenReturn(Optional.of(projectWithNullWorkspaces));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    workspaceService.saveWorkspace("testProject", testWorkspace);

    // Assert
    assertNotNull(projectWithNullWorkspaces.getWorkspaces());
    assertEquals(1, projectWithNullWorkspaces.getWorkspaces().size());
  }

  @Test
  void testLoadWorkspace_Success() {
    // Arrange
    Author author = new Author();
    author.setUserName("author1");
    Tweet tweet = new Tweet();
    tweet.setId("tweet1");
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(authorRepository.findAuthorByUserName("author1")).thenReturn(Optional.of(author));
    when(tweetRepository.findById("tweet1")).thenReturn(Optional.of(tweet));

    // Act
    workspaceService.loadWorkspace("testProject", "testWorkspace");

    // Assert
    verify(graphRepository).clearWorkspaceMembership();
    verify(authorRepository).findAuthorByUserName("author1");
    verify(authorRepository).save(author);
    verify(tweetRepository).findById("tweet1");
    verify(tweetRepository).save(tweet);
  }

  @Test
  void testLoadWorkspace_ProjectNotFound() {
    // Arrange
    when(projectRepository.findByName("nonExistent")).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.loadWorkspace("nonExistent", "testWorkspace"));
    assertEquals("Project with name 'nonExistent' does not exist", exception.getMessage());
  }

  @Test
  void testLoadWorkspace_WorkspaceNotFound() {
    // Arrange
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.loadWorkspace("testProject", "nonExistentWorkspace"));
    assertTrue(exception.getMessage().contains("not found in project"));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
  }

  @Test
  void testDeleteWorkspace_Success() {
    // Arrange
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    workspaceService.deleteWorkspace("testProject", "testWorkspace");

    // Assert
    assertTrue(testProject.getWorkspaces().isEmpty());
    verify(projectRepository).save(testProject);
  }

  @Test
  void testDeleteWorkspace_NullWorkspaceName() {
    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class, () -> workspaceService.deleteWorkspace("testProject", null));
    assertEquals("Workspace name cannot be null or empty", exception.getMessage());
  }

  @Test
  void testDeleteWorkspace_ProjectNotFound() {
    // Arrange
    when(projectRepository.findByName("nonExistent")).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.deleteWorkspace("nonExistent", "testWorkspace"));
    assertEquals("Project with name 'nonExistent' does not exist", exception.getMessage());
  }

  @Test
  void testDeleteWorkspace_NoWorkspaces() {
    // Arrange
    Project projectWithNoWorkspaces =
        Project.builder().name("testProject").workspaces(new ArrayList<>()).build();
    when(projectRepository.findByName("testProject"))
        .thenReturn(Optional.of(projectWithNoWorkspaces));

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.deleteWorkspace("testProject", "testWorkspace"));
    assertTrue(exception.getMessage().contains("has no workspaces"));
  }

  @Test
  void testDeleteWorkspace_WorkspaceNotFound() {
    // Arrange
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.deleteWorkspace("testProject", "nonExistent"));
    assertTrue(exception.getMessage().contains("does not exist in project"));
  }

  @Test
  void testGetWorkspaceByName_Success() {
    // Arrange
    when(projectRepository.findWorkspaceByProjectNameAndWorkspaceName(
            "testProject", "testWorkspace"))
        .thenReturn(Optional.of(testProject));

    // Act
    Workspace result = workspaceService.getWorkspaceByName("testProject", "testWorkspace");

    // Assert
    assertNotNull(result);
    assertEquals("testWorkspace", result.getName());
  }

  @Test
  void testGetWorkspaceByName_NullName() {
    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class, () -> workspaceService.getWorkspaceByName("testProject", null));
    assertEquals("Workspace name cannot be null or empty", exception.getMessage());
  }

  @Test
  void testGetWorkspaceByName_NotFound() {
    // Arrange
    when(projectRepository.findWorkspaceByProjectNameAndWorkspaceName("testProject", "nonExistent"))
        .thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.getWorkspaceByName("testProject", "nonExistent"));
    assertTrue(exception.getMessage().contains("not found in project"));
  }

  @Test
  void testGetWorkspaceByNameWithFullNodes_Success() {
    // Arrange
    when(projectRepository.findWorkspaceByProjectNameAndWorkspaceName(
            "testProject", "testWorkspace"))
        .thenReturn(Optional.of(testProject));
    when(authorRepository.findFullAuthorNodesByIds(anySet())).thenReturn(List.of(authorNode));
    when(tweetRepository.findFullTweetNodesByIds(anySet())).thenReturn(List.of(tweetNode));

    // Act
    Workspace result =
        workspaceService.getWorkspaceByNameWithFullNodes("testProject", "testWorkspace");

    // Assert
    assertNotNull(result);
    assertEquals("testWorkspace", result.getName());
    assertEquals(2, result.getNodes().size());
    verify(authorRepository).findFullAuthorNodesByIds(anySet());
    verify(tweetRepository).findFullTweetNodesByIds(anySet());
  }

  @Test
  void testGetWorkspaceByNameWithFullNodes_EmptyNodes() {
    // Arrange
    Workspace workspaceWithNoNodes =
        Workspace.builder()
            .name("emptyWorkspace")
            .nodes(new ArrayList<>())
            .edges(new ArrayList<>())
            .build();
    Project projectWithEmptyWorkspace =
        Project.builder()
            .name("testProject")
            .workspaces(new ArrayList<>(List.of(workspaceWithNoNodes)))
            .build();
    when(projectRepository.findWorkspaceByProjectNameAndWorkspaceName(
            "testProject", "emptyWorkspace"))
        .thenReturn(Optional.of(projectWithEmptyWorkspace));

    // Act
    Workspace result =
        workspaceService.getWorkspaceByNameWithFullNodes("testProject", "emptyWorkspace");

    // Assert
    assertNotNull(result);
    assertTrue(result.getNodes().isEmpty());
    verify(authorRepository, never()).findFullAuthorNodesByIds(anySet());
  }

  @Test
  void testUpdateWorkspaceMembership_SingleNode_Author() {
    // Arrange
    Author author = new Author();
    author.setUserName("author1");
    when(authorRepository.findAuthorByUserName("author1")).thenReturn(Optional.of(author));

    // Act
    workspaceService.updateWorkspaceMembership(authorNode, true);

    // Assert
    verify(authorRepository).findAuthorByUserName("author1");
    verify(authorRepository).save(author);
  }

  @Test
  void testUpdateWorkspaceMembership_SingleNode_Tweet() {
    // Arrange
    Tweet tweet = new Tweet();
    tweet.setId("tweet1");
    when(tweetRepository.findById("tweet1")).thenReturn(Optional.of(tweet));

    // Act
    workspaceService.updateWorkspaceMembership(tweetNode, true);

    // Assert
    verify(tweetRepository).findById("tweet1");
    verify(tweetRepository).save(tweet);
  }

  @Test
  void testUpdateWorkspaceMembership_SingleNode_Hashtag() {
    // Arrange
    Hashtag hashtag = new Hashtag();
    hashtag.setHashtag("hashtag1");
    when(hashtagRepository.findHashtagByHashtag("hashtag1")).thenReturn(Optional.of(hashtag));

    // Act
    workspaceService.updateWorkspaceMembership(hashtagNode, false);

    // Assert
    verify(hashtagRepository).findHashtagByHashtag("hashtag1");
    verify(hashtagRepository).save(hashtag);
  }

  @Test
  void testUpdateWorkspaceMembership_SingleNode_NullNode() {
    // Act
    workspaceService.updateWorkspaceMembership((NodeDto) null, true);

    // Assert
    verify(authorRepository, never()).findAuthorByUserName(anyString());
    verify(tweetRepository, never()).findById(anyString());
    verify(hashtagRepository, never()).findHashtagByHashtag(anyString());
  }

  @Test
  void testUpdateWorkspaceMembership_SingleNode_NullNodeType() {
    // Arrange
    NodeDto nodeWithNullType = new AuthorNodeDto(null, null);
    nodeWithNullType.setId("author1");
    nodeWithNullType.setNodeType(null);

    // Act
    workspaceService.updateWorkspaceMembership(nodeWithNullType, true);

    // Assert
    verify(authorRepository, never()).findById(anyString());
  }

  @Test
  void testUpdateWorkspaceMembership_SingleNode_NodeNotFound() {
    // Arrange
    when(authorRepository.findAuthorByUserName("author1")).thenReturn(Optional.empty());

    // Act
    workspaceService.updateWorkspaceMembership(authorNode, true);

    // Assert
    verify(authorRepository).findAuthorByUserName("author1");
    verify(authorRepository, never()).save(any(Author.class));
  }

  @Test
  void testUpdateWorkspaceMembership_MultipleNodes() {
    // Arrange
    Author author = new Author();
    author.setUserName("author1");
    Tweet tweet = new Tweet();
    tweet.setId("tweet1");
    when(authorRepository.findAuthorByUserName("author1")).thenReturn(Optional.of(author));
    when(tweetRepository.findById("tweet1")).thenReturn(Optional.of(tweet));
    List<NodeDto> nodes = List.of(authorNode, tweetNode);

    // Act
    workspaceService.updateWorkspaceMembership(nodes, true);

    // Assert
    verify(authorRepository).findAuthorByUserName("author1");
    verify(authorRepository).save(author);
    verify(tweetRepository).findById("tweet1");
    verify(tweetRepository).save(tweet);
  }

  @Test
  void testValidateAndImportWorkspace_Success() throws Exception {
    // Arrange
    String workspaceJson =
        "{\"name\":\"importedWorkspace\",\"nodes\":[{\"id\":\"author1\",\"nodeType\":\"AUTHOR\"}],\"edges\":[]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("importedWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode)))
            .edges(new ArrayList<>())
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList())).thenReturn(List.of(authorNode));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    WorkspaceImportResult result = workspaceService.validateAndImportWorkspace("testProject", file);

    // Assert
    assertNotNull(result);
    assertEquals("importedWorkspace", result.getWorkspaceName());
    assertEquals(1, result.getTotalNodes());
    assertEquals(1, result.getImportedNodes());
    verify(objectMapper).readValue(any(InputStream.class), eq(Workspace.class));
    verify(graphRepository).findExistingNodesByIdsAndTypes(anyList());
  }

  @Test
  void testValidateAndImportWorkspace_InvalidFileExtension() {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile("workspace", "workspace.txt", "text/plain", "test".getBytes());

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("testProject", file));
    assertEquals("Only JSON files are allowed", exception.getMessage());
    assertEquals(HttpStatus.BAD_REQUEST, exception.getHttpStatus());
  }

  @Test
  void testValidateAndImportWorkspace_IOError() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", "invalid json".getBytes());
    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenThrow(new IOException("Parse error"));

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("testProject", file));
    assertTrue(exception.getMessage().contains("Failed to read workspace file"));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getHttpStatus());
  }

  @Test
  void testValidateAndImportWorkspace_NullWorkspaceName() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile("workspace", "workspace.json", "application/json", "{}".getBytes());
    Workspace workspaceWithNullName = Workspace.builder().name(null).build();
    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(workspaceWithNullName);

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("testProject", file));
    assertEquals("Invalid workspace: name is required", exception.getMessage());
  }

  @Test
  void testValidateAndImportWorkspace_NoNodesAndEdges() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", "{\"name\":\"test\"}".getBytes());
    Workspace workspaceWithNoData =
        Workspace.builder().name("test").nodes(null).edges(null).build();
    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(workspaceWithNoData);

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("testProject", file));
    assertTrue(
        exception.getMessage().contains("No valid nodes and edges found in the workspace file"));
  }

  @Test
  void testValidateAndImportWorkspace_ProjectNotFound() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace",
            "workspace.json",
            "application/json",
            "{\"name\":\"test\",\"nodes\":[],\"edges\":[]}".getBytes());
    Workspace parsedWorkspace =
        Workspace.builder().name("test").nodes(new ArrayList<>()).edges(new ArrayList<>()).build();
    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("nonExistent")).thenReturn(Optional.empty());

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("nonExistent", file));
    assertTrue(exception.getMessage().contains("does not exist"));
    assertEquals(HttpStatus.NOT_FOUND, exception.getHttpStatus());
  }

  @Test
  void testValidateAndImportWorkspace_DuplicateWorkspaceName() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace",
            "workspace.json",
            "application/json",
            "{\"name\":\"testWorkspace\",\"nodes\":[],\"edges\":[]}".getBytes());
    Workspace duplicateWorkspace =
        Workspace.builder()
            .name("testWorkspace")
            .nodes(new ArrayList<>())
            .edges(new ArrayList<>())
            .build();
    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(duplicateWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("testProject", file));
    assertTrue(exception.getMessage().contains("already exists"));
    assertEquals(HttpStatus.CONFLICT, exception.getHttpStatus());
  }

  @Test
  void testValidateAndImportWorkspace_NoValidNodesOrEdges() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace",
            "workspace.json",
            "application/json",
            "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"invalid\",\"nodeType\":\"AUTHOR\"}],\"edges\":[]}"
                .getBytes());
    AuthorNodeDto invalidNode = new AuthorNodeDto(null, null);
    invalidNode.setId("invalid");
    invalidNode.setNodeType(NodeType.AUTHOR);
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(invalidNode)))
            .edges(new ArrayList<>())
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList()))
        .thenReturn(Collections.emptyList());

    // Act & Assert
    WorkspaceException exception =
        assertThrows(
            WorkspaceException.class,
            () -> workspaceService.validateAndImportWorkspace("testProject", file));
    assertTrue(exception.getMessage().contains("No valid nodes or edges found in the database"));
  }

  @Test
  void testValidateAndImportWorkspace_WithValidEdges() throws Exception {
    // Arrange
    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"author1\",\"nodeType\":\"AUTHOR\"},{\"id\":\"tweet1\",\"nodeType\":\"TWEET\"}],\"edges\":[{\"source\":\"author1\",\"target\":\"tweet1\",\"relationType\":\"POSTED\"}]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode, tweetNode)))
            .edges(new ArrayList<>(List.of(testLink)))
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList()))
        .thenReturn(List.of(authorNode, tweetNode));
    when(graphRepository.findExistingRelations(anyList())).thenReturn(List.of(testLink));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    WorkspaceImportResult result = workspaceService.validateAndImportWorkspace("testProject", file);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.getImportedEdges());
    verify(graphRepository).findExistingRelations(anyList());
  }

  @Test
  void testValidateAndImportWorkspace_FilterInvalidEdges() throws Exception {
    // Arrange
    LinkDto invalidLink = new LinkDto("invalid1", "invalid2", RelationType.POSTED, 1);
    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"author1\",\"nodeType\":\"AUTHOR\"}],\"edges\":[{\"source\":\"invalid1\",\"target\":\"invalid2\",\"relationType\":\"POSTED\"}]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode)))
            .edges(new ArrayList<>(List.of(invalidLink)))
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList())).thenReturn(List.of(authorNode));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    WorkspaceImportResult result = workspaceService.validateAndImportWorkspace("testProject", file);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.getImportedEdges());
    verify(graphRepository, never()).findExistingRelations(anyList());
  }

  @Test
  void testValidateAndImportWorkspace_NodesWithNullId() throws Exception {
    // Arrange
    AuthorNodeDto nodeWithNullId = new AuthorNodeDto(null, null);
    nodeWithNullId.setId(null);
    nodeWithNullId.setName("author1");
    nodeWithNullId.setNodeType(NodeType.AUTHOR);

    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"nodeType\":\"AUTHOR\"}],\"edges\":[]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(nodeWithNullId)))
            .edges(new ArrayList<>())
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act & Assert
    assertThrows(
        WorkspaceException.class,
        () -> workspaceService.validateAndImportWorkspace("testProject", file));
  }

  @Test
  void testValidateAndImportWorkspace_NodesWithNullNodeType() throws Exception {
    // Arrange
    AuthorNodeDto nodeWithNullType = new AuthorNodeDto(null, null);
    nodeWithNullType.setId("author1");
    nodeWithNullType.setName("author1");
    nodeWithNullType.setNodeType(null);

    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"author1\"}],\"edges\":[]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(nodeWithNullType)))
            .edges(new ArrayList<>())
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act & Assert
    assertThrows(
        WorkspaceException.class,
        () -> workspaceService.validateAndImportWorkspace("testProject", file));
  }

  @Test
  void testValidateAndImportWorkspace_EdgesWithNullSource() throws Exception {
    // Arrange
    LinkDto edgeWithNullSource = new LinkDto(null, "tweet1", RelationType.POSTED, 1);
    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"author1\",\"nodeType\":\"AUTHOR\"}],\"edges\":[{\"target\":\"tweet1\",\"relationType\":\"POSTED\"}]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode)))
            .edges(new ArrayList<>(List.of(edgeWithNullSource)))
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList())).thenReturn(List.of(authorNode));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    WorkspaceImportResult result = workspaceService.validateAndImportWorkspace("testProject", file);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.getImportedEdges());
  }

  @Test
  void testValidateAndImportWorkspace_EdgesWithNullTarget() throws Exception {
    // Arrange
    LinkDto edgeWithNullTarget = new LinkDto("author1", null, RelationType.POSTED, 1);
    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"author1\",\"nodeType\":\"AUTHOR\"}],\"edges\":[{\"source\":\"author1\",\"relationType\":\"POSTED\"}]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode)))
            .edges(new ArrayList<>(List.of(edgeWithNullTarget)))
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList())).thenReturn(List.of(authorNode));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    WorkspaceImportResult result = workspaceService.validateAndImportWorkspace("testProject", file);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.getImportedEdges());
  }

  @Test
  void testValidateAndImportWorkspace_NullEdgeInList() throws Exception {
    // Arrange
    String workspaceJson =
        "{\"name\":\"newWorkspace\",\"nodes\":[{\"id\":\"author1\",\"nodeType\":\"AUTHOR\"}],\"edges\":[null]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    List<LinkDto> edgesWithNull = new ArrayList<>();
    edgesWithNull.add(null);

    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>(List.of(authorNode)))
            .edges(edgesWithNull)
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(graphRepository.findExistingNodesByIdsAndTypes(anyList())).thenReturn(List.of(authorNode));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    WorkspaceImportResult result = workspaceService.validateAndImportWorkspace("testProject", file);

    // Assert
    assertNotNull(result);
    assertEquals(0, result.getImportedEdges());
  }

  @Test
  void testValidateAndImportWorkspace_NullNodeInList() throws Exception {
    // Arrange
    String workspaceJson = "{\"name\":\"newWorkspace\",\"nodes\":[null],\"edges\":[]}";
    MockMultipartFile file =
        new MockMultipartFile(
            "workspace", "workspace.json", "application/json", workspaceJson.getBytes());
    List<NodeDto> nodesWithNull = new ArrayList<>();
    nodesWithNull.add(null);

    Workspace parsedWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(nodesWithNull)
            .edges(new ArrayList<>())
            .build();

    when(objectMapper.readValue(any(InputStream.class), eq(Workspace.class)))
        .thenReturn(parsedWorkspace);
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));

    // Act & Assert
    assertThrows(
        WorkspaceException.class,
        () -> workspaceService.validateAndImportWorkspace("testProject", file));
  }

  @Test
  void testSaveWorkspace_WithNullNameInWorkspacesList() {
    // Arrange
    Workspace existingWithNullName =
        Workspace.builder().name(null).nodes(new ArrayList<>()).edges(new ArrayList<>()).build();
    testProject.setWorkspaces(new ArrayList<>(List.of(existingWithNullName)));
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Workspace newWorkspace =
        Workspace.builder()
            .name("newWorkspace")
            .nodes(new ArrayList<>())
            .edges(new ArrayList<>())
            .build();

    // Act
    workspaceService.saveWorkspace("testProject", newWorkspace);

    // Assert
    verify(projectRepository).save(any(Project.class));
    assertEquals(2, testProject.getWorkspaces().size());
  }

  @Test
  void testDeleteWorkspace_WithNullNameInWorkspacesList() {
    // Arrange
    Workspace workspaceWithNullName =
        Workspace.builder().name(null).nodes(new ArrayList<>()).edges(new ArrayList<>()).build();
    Workspace validWorkspace =
        Workspace.builder()
            .name("validWorkspace")
            .nodes(new ArrayList<>())
            .edges(new ArrayList<>())
            .build();
    testProject.setWorkspaces(new ArrayList<>(List.of(workspaceWithNullName, validWorkspace)));
    when(projectRepository.findByName("testProject")).thenReturn(Optional.of(testProject));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    workspaceService.deleteWorkspace("testProject", "validWorkspace");

    // Assert
    verify(projectRepository).save(any(Project.class));
    assertEquals(1, testProject.getWorkspaces().size());
  }

  @Test
  void testGetWorkspaceByName_BlankName() {
    // Arrange

    // Act & Assert
    ProjectException exception =
        assertThrows(
            ProjectException.class,
            () -> workspaceService.getWorkspaceByName("testProject", "   "));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    assertTrue(exception.getMessage().contains("cannot be null or empty"));
  }

  @Test
  void testUpdateWorkspaceMembership_TweetNotFound() {
    // Arrange
    TweetNodeDto tweetNode = new TweetNodeDto(null, null, null, null, null, null, null, null, null);
    tweetNode.setId("nonExistentTweet");
    tweetNode.setNodeType(NodeType.TWEET);

    when(tweetRepository.findById("nonExistentTweet")).thenReturn(Optional.empty());

    // Act
    workspaceService.updateWorkspaceMembership(tweetNode, true);

    // Assert
    verify(tweetRepository).findById("nonExistentTweet");
    verify(tweetRepository, never()).save(any());
  }

  @Test
  void testUpdateWorkspaceMembership_HashtagNotFound() {
    // Arrange
    HashtagNodeDto hashtagNode = new HashtagNodeDto();
    hashtagNode.setId("nonExistentHashtag");
    hashtagNode.setName("nonExistentHashtag");
    hashtagNode.setNodeType(NodeType.HASHTAG);

    when(hashtagRepository.findHashtagByHashtag("nonExistentHashtag")).thenReturn(Optional.empty());

    // Act
    workspaceService.updateWorkspaceMembership(hashtagNode, true);

    // Assert
    verify(hashtagRepository).findHashtagByHashtag("nonExistentHashtag");
    verify(hashtagRepository, never()).save(any());
  }
}
