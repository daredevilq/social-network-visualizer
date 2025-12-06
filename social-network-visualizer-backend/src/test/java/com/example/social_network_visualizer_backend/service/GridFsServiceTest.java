package com.example.social_network_visualizer_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.mongodb.client.gridfs.GridFSFindIterable;
import com.mongodb.client.gridfs.model.GridFSFile;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class GridFsServiceTest {

  @Mock
  private GridFsTemplate gridFsTemplate;

  @Mock
  private MultipartFile multipartFile;

  @Mock
  private GridFSFile gridFSFile;

  @Mock
  private GridFsResource gridFsResource;

  @InjectMocks
  private GridFsService gridFsService;

  @Test
  void testStoreFile_Success() throws IOException {
    // Arrange
    String projectName = "testProject";
    String filename = "test.json";
    String contentType = "application/json";
    ObjectId expectedFileId = new ObjectId();
    byte[] fileContent = "{\"test\": \"data\"}".getBytes();
    InputStream inputStream = new ByteArrayInputStream(fileContent);

    when(multipartFile.getOriginalFilename()).thenReturn(filename);
    when(multipartFile.getContentType()).thenReturn(contentType);
    when(multipartFile.getInputStream()).thenReturn(inputStream);
    when(gridFsTemplate.store(any(InputStream.class), eq(filename), eq(contentType), any(Document.class)))
            .thenReturn(expectedFileId);

    // Act
    String result = gridFsService.storeFile(projectName, multipartFile);

    // Assert
    assertNotNull(result);
    assertEquals(expectedFileId.toString(), result);
    verify(multipartFile).getInputStream();
    verify(gridFsTemplate).store(any(InputStream.class), eq(filename), eq(contentType), any(Document.class));
  }

  @Test
  void testStoreFile_WithMetadata() throws IOException {
    // Arrange
    String projectName = "myProject";
    String filename = "data.json";
    ObjectId fileId = new ObjectId();
    byte[] content = "test content".getBytes();

    when(multipartFile.getOriginalFilename()).thenReturn(filename);
    when(multipartFile.getContentType()).thenReturn("application/json");
    when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(content));
    when(gridFsTemplate.store(any(), any(), any(), any(Document.class))).thenReturn(fileId);

    ArgumentCaptor<Document> metadataCaptor = ArgumentCaptor.forClass(Document.class);

    // Act
    gridFsService.storeFile(projectName, multipartFile);

    // Assert
    verify(gridFsTemplate).store(any(), eq(filename), eq("application/json"), metadataCaptor.capture());
    Document metadata = metadataCaptor.getValue();
    assertEquals(projectName, metadata.get("projectName"));
  }

  @Test
  void testStoreFile_ThrowsIOException() throws IOException {
    // Arrange
    String projectName = "testProject";
    when(multipartFile.getOriginalFilename()).thenReturn("test.json");
    when(multipartFile.getInputStream()).thenThrow(new IOException("File read error"));

    // Act & Assert
    assertThrows(IOException.class, () -> gridFsService.storeFile(projectName, multipartFile));
    verify(gridFsTemplate, never()).store(any(), any(), any(), any());
  }

  @Test
  void testGetFile_Success() {
    // Arrange
    String fileId = new ObjectId().toString();
    when(gridFsTemplate.findOne(any(Query.class))).thenReturn(gridFSFile);
    when(gridFsTemplate.getResource(gridFSFile)).thenReturn(gridFsResource);

    // Act
    GridFsResource result = gridFsService.getFile(fileId);

    // Assert
    assertNotNull(result);
    assertEquals(gridFsResource, result);
    verify(gridFsTemplate).findOne(any(Query.class));
    verify(gridFsTemplate).getResource(gridFSFile);
  }

  @Test
  void testGetFile_NotFound() {
    // Arrange
    String fileId = new ObjectId().toString();
    when(gridFsTemplate.findOne(any(Query.class))).thenReturn(null);

    // Act
    GridFsResource result = gridFsService.getFile(fileId);

    // Assert
    assertNull(result);
    verify(gridFsTemplate).findOne(any(Query.class));
    verify(gridFsTemplate, never()).getResource((String) any());
  }

  @Test
  void testDeleteFile_Success() {
    // Arrange
    String fileId = new ObjectId().toString();

    // Act
    gridFsService.deleteFile(fileId);

    // Assert
    verify(gridFsTemplate).delete(any(Query.class));
  }

  @Test
  void testDeleteProjectFiles_Success() {
    // Arrange
    String projectName = "testProject";

    // Act
    gridFsService.deleteProjectFiles(projectName);

    // Assert
    verify(gridFsTemplate).delete(any(Query.class));
  }

  @Test
  void testStoreFile_WithNullFilename() throws IOException {
    // Arrange
    String projectName = "testProject";
    when(multipartFile.getOriginalFilename()).thenReturn(null);
    when(multipartFile.getContentType()).thenReturn("application/json");
    when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("test".getBytes()));

    // Act & Assert
    assertThrows(NullPointerException.class, () -> gridFsService.storeFile(projectName, multipartFile));
  }

  @Test
  void testGetFile_WithInvalidObjectId() {
    // Arrange
    String invalidFileId = "invalid-id";

    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> gridFsService.getFile(invalidFileId));
  }

  @Test
  void testDeleteFile_WithInvalidObjectId() {
    // Arrange
    String invalidFileId = "not-an-objectid";

    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> gridFsService.deleteFile(invalidFileId));
  }
}