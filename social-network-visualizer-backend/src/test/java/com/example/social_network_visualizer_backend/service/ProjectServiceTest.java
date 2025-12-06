package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.social_network_visualizer_backend.dto.ProjectSummary;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.project.MetricConfig;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.ProjectConfig;
import com.example.social_network_visualizer_backend.model.project.ProjectFile;
import com.example.social_network_visualizer_backend.repository.ProjectRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

  @Mock private ProjectParser projectParser;
  @Mock private Neo4jService neo4jService;
  @Mock private MongodbService mongodbService;
  @Mock private ProjectRepository projectRepository;
  @Mock private GridFsService gridFsService;
  @Mock private MetricComputationService metricComputationService;
  @Mock private ObjectMapper objectMapper;

  @InjectMocks private ProjectService projectService;

  private Project testProject;
  private ProjectConfig testConfig;
  private ProjectFile testFile;

  @BeforeEach
  void setUp() {
    testConfig = new ProjectConfig(Instant.now(), Collections.emptyList());
    testFile = ProjectFile.builder()
        .filename("test.json")
        .gridFsId("gridfs-123")
        .sizeInBytes(1024L)
        .build();
    testProject = Project.builder()
        .name("testProject")
        .config(testConfig)
        .files(new ArrayList<>(List.of(testFile)))
        .build();
  }

  @Test
  void testGetAllProjects_Success() {
    // Arrange
    List<Project> projects = List.of(
        testProject,
        Project.builder().name("project2").files(new ArrayList<>()).build()
    );
    when(projectRepository.findAll()).thenReturn(projects);

    // Act
    List<ProjectSummary> result = projectService.getAllProjects();

    // Assert
    assertEquals(2, result.size());
    assertEquals("testProject", result.get(0).name());
    assertEquals(1, result.get(0).fileCount());
    assertEquals("project2", result.get(1).name());
    assertEquals(0, result.get(1).fileCount());
    verify(projectRepository).findAll();
  }

  @Test
  void testGetAllProjects_EmptyList() {
    // Arrange
    when(projectRepository.findAll()).thenReturn(Collections.emptyList());

    // Act
    List<ProjectSummary> result = projectService.getAllProjects();

    // Assert
    assertTrue(result.isEmpty());
    verify(projectRepository).findAll();
  }

  @Test
  void testGetAllProjects_NullFiles() {
    // Arrange
    Project projectWithNullFiles = Project.builder().name("nullFilesProject").files(null).build();
    when(projectRepository.findAll()).thenReturn(List.of(projectWithNullFiles));

    // Act
    List<ProjectSummary> result = projectService.getAllProjects();

    // Assert
    assertEquals(1, result.size());
    assertEquals(0, result.get(0).fileCount());
  }

  @Test
  void testImportProject_Success() {
    // Arrange
    String projectName = "testProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));
    when(projectParser.parseDirectory(projectName)).thenReturn(10);

    // Act
    int result = projectService.importProject(projectName);

    // Assert
    assertEquals(10, result);
    verify(projectRepository).findByName(projectName);
    verify(neo4jService).waitForNeo4jToBeAvailable();
    verify(mongodbService).waitForMongoDBToBeAvailable();
    verify(neo4jService).handleDatabaseDrop();
    verify(projectParser).parseDirectory(projectName);
    verify(neo4jService).createAdditionalRelationsInGraph();
    verify(metricComputationService).computeMetrics(projectName, testConfig);
  }

  @Test
  void testImportProject_ProjectNotFound() {
    // Arrange
    String projectName = "nonExistentProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.importProject(projectName)
    );
    assertEquals("Project with name '" + projectName + "' does not exist", exception.getMessage());
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    verify(projectRepository).findByName(projectName);
    verify(neo4jService, never()).waitForNeo4jToBeAvailable();
  }

  @Test
  void testCreateProject_Success() throws IOException {
    // Arrange
    String projectName = "newProject";
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-456");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.createProject(projectName, testConfig, files);

    // Assert
    assertTrue(skippedFiles.isEmpty());
    verify(projectRepository, times(2)).save(any(Project.class));
    verify(gridFsService).storeFile(eq(projectName), any(MultipartFile.class));
  }

  @Test
  void testCreateProject_WithSkippedFiles() throws IOException {
    // Arrange
    String projectName = "newProject";
    MockMultipartFile validFile = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MockMultipartFile emptyFile = new MockMultipartFile(
        "file2",
        "empty.json",
        "application/json",
        new byte[0]
    );
    MockMultipartFile invalidFile = new MockMultipartFile(
        "file3",
        "test.txt",
        "text/plain",
        "text".getBytes()
    );
    MultipartFile[] files = {validFile, emptyFile, invalidFile};
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-456");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.createProject(projectName, testConfig, files);

    // Assert
    assertEquals(2, skippedFiles.size());
    assertTrue(skippedFiles.contains("empty.json"));
    assertTrue(skippedFiles.contains("test.txt"));
    verify(gridFsService, times(1)).storeFile(eq(projectName), any(MultipartFile.class));
  }

  @Test
  void testCreateProject_SaveException() throws IOException {
    // Arrange
    String projectName = "newProject";
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-456");
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0))
        .thenThrow(new RuntimeException("Database error"));

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.createProject(projectName, testConfig, files)
    );
    assertTrue(exception.getMessage().contains("Failed to save project"));
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
  }

  @Test
  void testUpdateProjectWithFiles_Success() throws IOException {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "newfile.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-789");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.updateProjectWithFiles(projectName, files);

    // Assert
    assertTrue(skippedFiles.isEmpty());
    verify(projectRepository).findByName(projectName);
    verify(gridFsService).storeFile(eq(projectName), any(MultipartFile.class));
    verify(projectRepository).save(testProject);
  }

  @Test
  void testUpdateProjectWithFiles_ProjectNotFound() {
    // Arrange
    String projectName = "nonExistent";
    MultipartFile[] files = {new MockMultipartFile("file", "test.json", "application/json", new byte[0])};
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.updateProjectWithFiles(projectName, files)
    );
    assertEquals("Project with name '" + projectName + "' does not exist", exception.getMessage());
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
  }

  @Test
  void testUpdateProjectWithFiles_NullFiles() throws IOException {
    // Arrange
    String projectName = "testProject";
    Project projectWithNullFiles = Project.builder()
        .name(projectName)
        .config(testConfig)
        .files(null)
        .build();
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(projectWithNullFiles));
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-999");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.updateProjectWithFiles(projectName, files);

    // Assert
    assertTrue(skippedFiles.isEmpty());
    assertNotNull(projectWithNullFiles.getFiles());
    verify(gridFsService).storeFile(eq(projectName), any(MultipartFile.class));
  }

  @Test
  void testDeleteProject_Success() {
    // Arrange
    String projectName = "testProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));

    // Act
    projectService.deleteProject(projectName);

    // Assert
    verify(projectRepository).findByName(projectName);
    verify(gridFsService).deleteProjectFiles(projectName);
    verify(projectRepository).deleteByName(projectName);
  }

  @Test
  void testDeleteProject_NotFound() {
    // Arrange
    String projectName = "nonExistent";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.deleteProject(projectName)
    );
    assertEquals("Project '" + projectName + "' not found", exception.getMessage());
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    verify(gridFsService, never()).deleteProjectFiles(anyString());
    verify(projectRepository, never()).deleteByName(anyString());
  }

  @Test
  void testDeleteProject_Exception() {
    // Arrange
    String projectName = "testProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));
    doThrow(new RuntimeException("GridFS error")).when(gridFsService).deleteProjectFiles(projectName);

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.deleteProject(projectName)
    );
    assertTrue(exception.getMessage().contains("Failed to delete project"));
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
  }

  @Test
  void testGetProjectFileNames_Success() {
    // Arrange
    String projectName = "testProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));

    // Act
    List<String> result = projectService.getProjectFileNames(projectName);

    // Assert
    assertEquals(1, result.size());
    assertEquals("test.json", result.get(0));
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectFileNames_ProjectNotFound() {
    // Arrange
    String projectName = "nonExistent";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.getProjectFileNames(projectName)
    );
    assertEquals("Project with name '" + projectName + "' does not exist", exception.getMessage());
  }

  @Test
  void testGetProjectFileNames_EmptyFiles() {
    // Arrange
    String projectName = "testProject";
    Project projectWithNoFiles = Project.builder()
        .name(projectName)
        .files(new ArrayList<>())
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(projectWithNoFiles));

    // Act
    List<String> result = projectService.getProjectFileNames(projectName);

    // Assert
    assertTrue(result.isEmpty());
  }

  @Test
  void testGetProjectFileNames_NullFiles() {
    // Arrange
    String projectName = "testProject";
    Project projectWithNullFiles = Project.builder()
        .name(projectName)
        .files(null)
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(projectWithNullFiles));

    // Act
    List<String> result = projectService.getProjectFileNames(projectName);

    // Assert
    assertTrue(result.isEmpty());
  }

  @Test
  void testUpdateOpenedProject_Success() throws IOException {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "newfile.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-111");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.updateOpenedProject(projectName, files);

    // Assert
    assertTrue(skippedFiles.isEmpty());
    verify(projectRepository, times(1)).findByName(projectName);
    verify(projectRepository).save(testProject);
    verify(gridFsService).storeFile(eq(projectName), any(MultipartFile.class));
  }

  @Test
  void testUpdateOpenedProject_ProjectNotFound() {
    // Arrange
    String projectName = "nonExistent";
    MultipartFile[] files = {new MockMultipartFile("file", "test.json", "application/json", new byte[0])};
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.updateOpenedProject(projectName, files)
    );
    assertEquals("Project with name '" + projectName + "' does not exist", exception.getMessage());
  }

  @Test
  void testUpdateOpenedProject_NullConfig() throws IOException {
    // Arrange
    String projectName = "testProject";
    Project projectWithNullConfig = Project.builder()
        .name(projectName)
        .config(null)
        .files(new ArrayList<>())
        .build();
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(projectRepository.findByName(projectName))
        .thenReturn(Optional.of(projectWithNullConfig))
        .thenReturn(Optional.of(projectWithNullConfig));
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-222");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.updateOpenedProject(projectName, files);

    // Assert
    assertTrue(skippedFiles.isEmpty());
    verify(metricComputationService, never()).computeMetrics(anyString(), any());
  }

  @Test
  void testDeleteFileFromProject_Success() {
    // Arrange
    String projectName = "testProject";
    String fileName = "test.json";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    projectService.deleteFileFromProject(projectName, fileName);

    // Assert
    verify(projectRepository).findByName(projectName);
    verify(gridFsService).deleteFile("gridfs-123");
    verify(projectRepository).save(testProject);
    assertTrue(testProject.getFiles().isEmpty());
  }

  @Test
  void testDeleteFileFromProject_ProjectNotFound() {
    // Arrange
    String projectName = "nonExistent";
    String fileName = "test.json";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.deleteFileFromProject(projectName, fileName)
    );
    assertEquals("Project with name '" + projectName + "' does not exist", exception.getMessage());
  }

  @Test
  void testDeleteFileFromProject_EmptyFiles() {
    // Arrange
    String projectName = "testProject";
    String fileName = "test.json";
    Project projectWithNoFiles = Project.builder()
        .name(projectName)
        .files(new ArrayList<>())
        .build();
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(projectWithNoFiles));

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.deleteFileFromProject(projectName, fileName)
    );
    assertTrue(exception.getMessage().contains("does not exist in project"));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
  }

  @Test
  void testDeleteFileFromProject_FileNotFound() {
    // Arrange
    String projectName = "testProject";
    String fileName = "nonexistent.json";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.deleteFileFromProject(projectName, fileName)
    );
    assertTrue(exception.getMessage().contains("does not exist in project"));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
  }

  @Test
  void testDeleteFileFromProject_Exception() {
    // Arrange
    String projectName = "testProject";
    String fileName = "test.json";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));
    doThrow(new RuntimeException("GridFS error")).when(gridFsService).deleteFile(anyString());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.deleteFileFromProject(projectName, fileName)
    );
    assertTrue(exception.getMessage().contains("Failed to delete file"));
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
  }

  @Test
  void testGetProjectConfig_Success() {
    // Arrange
    String projectName = "testProject";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.of(testProject));

    // Act
    ProjectConfig result = projectService.getProjectConfig(projectName);

    // Assert
    assertNotNull(result);
    assertEquals(testConfig, result);
    verify(projectRepository).findByName(projectName);
  }

  @Test
  void testGetProjectConfig_ProjectNotFound() {
    // Arrange
    String projectName = "nonExistent";
    when(projectRepository.findByName(projectName)).thenReturn(Optional.empty());

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> projectService.getProjectConfig(projectName)
    );
    assertEquals("Project with name '" + projectName + "' does not exist", exception.getMessage());
  }

  @Test
  void testParseConfig_InvalidJson() {
    // Arrange
    String invalidJson = "{invalid json}";
    ObjectMapper realMapper = new ObjectMapper();
    ProjectService serviceWithRealMapper = new ProjectService(
        projectParser,
        neo4jService,
        mongodbService,
        projectRepository,
        gridFsService,
        metricComputationService,
        realMapper
    );

    // Act & Assert
    ProjectException exception = assertThrows(
        ProjectException.class,
        () -> serviceWithRealMapper.parseConfig(invalidJson)
    );
    assertTrue(exception.getMessage().contains("Invalid configuration format"));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
  }

  @Test
  void testAddFilesToProject_DuplicateFilenames() throws IOException {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file1 = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data1\"}".getBytes()
    );
    MockMultipartFile file2 = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data2\"}".getBytes()
    );
    MultipartFile[] files = {file1, file2};
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenReturn("gridfs-333")
        .thenReturn("gridfs-444");
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.createProject(projectName, testConfig, files);

    // Assert
    assertTrue(skippedFiles.isEmpty());
    verify(gridFsService, times(2)).storeFile(eq(projectName), any(MultipartFile.class));
  }

  @Test
  void testAddFilesToProject_NullFilename() throws IOException {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile fileWithNullName = new MockMultipartFile(
        "file",
        null,
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {fileWithNullName};
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.createProject(projectName, testConfig, files);

    // Assert
    assertEquals(1, skippedFiles.size());
    assertEquals("Unnamed file", skippedFiles.get(0));
    verify(gridFsService, never()).storeFile(anyString(), any(MultipartFile.class));
  }

  @Test
  void testAddFilesToProject_BlankFilename() throws IOException {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile fileWithBlankName = new MockMultipartFile(
        "file",
        "   ",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {fileWithBlankName};
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.createProject(projectName, testConfig, files);

    // Assert
    assertEquals(1, skippedFiles.size());
    assertEquals("Unnamed file", skippedFiles.get(0));
  }

  @Test
  void testAddFilesToProject_IOError() throws IOException {
    // Arrange
    String projectName = "testProject";
    MockMultipartFile file = new MockMultipartFile(
        "file",
        "test.json",
        "application/json",
        "{\"test\":\"data\"}".getBytes()
    );
    MultipartFile[] files = {file};
    when(gridFsService.storeFile(eq(projectName), any(MultipartFile.class)))
        .thenThrow(new IOException("Storage error"));
    when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    List<String> skippedFiles = projectService.createProject(projectName, testConfig, files);

    // Assert
    assertEquals(1, skippedFiles.size());
    assertEquals("test.json", skippedFiles.get(0));
  }

  @Test
  void testGetDefaultMetrics_Success() throws Exception {
    // Arrange
    MetricConfig metric1 = new MetricConfig(null, null, null, null);
    MetricConfig metric2 = new MetricConfig(null, null, null, null);
    List<MetricConfig> mockMetrics = List.of(metric1, metric2);

    when(objectMapper.readValue(any(InputStream.class), any(TypeReference.class)))
            .thenReturn(mockMetrics);

    // Act
    List<MetricConfig> result = projectService.getDefaultMetrics();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertSame(metric1, result.get(0));
    assertSame(metric2, result.get(1));
    verify(objectMapper).readValue(any(InputStream.class), any(TypeReference.class));
  }

  @Test
  void testGetDefaultMetrics_IOException() throws Exception {
    // Arrange
    when(objectMapper.readValue(any(InputStream.class), any(TypeReference.class)))
            .thenThrow(new IOException("File read error"));

    // Act & Assert
    ProjectException exception = assertThrows(ProjectException.class,
            () -> projectService.getDefaultMetrics());

    assertTrue(exception.getMessage().contains("Failed to load default metrics configuration"));
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
    verify(objectMapper).readValue(any(InputStream.class), any(TypeReference.class));
  }
}

