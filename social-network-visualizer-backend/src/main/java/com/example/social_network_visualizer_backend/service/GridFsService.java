package com.example.social_network_visualizer_backend.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class GridFsService {
  private final GridFsTemplate gridFsTemplate;

  public String storeFile(String projectName, MultipartFile file) throws IOException {
    String filename = file.getOriginalFilename();

    try (InputStream inputStream = file.getInputStream()) {
      ObjectId fileId =
          gridFsTemplate.store(
              inputStream,
              filename,
              file.getContentType(),
              new Document("projectName", projectName));

      log.info(
          "Stored file '{}' in GridFS for project '{}' with ID: {}",
          filename,
          projectName,
          fileId.toString());
      return fileId.toString();
    }
  }

  public GridFsResource getFile(String fileId) {
    GridFSFile gridFsFile =
        gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new ObjectId(fileId))));

    if (gridFsFile == null) {
      log.error("File with ID {} not found in GridFS", fileId);
      return null;
    }

    return gridFsTemplate.getResource(gridFsFile);
  }

  public List<GridFSFile> getProjectFiles(String projectName) {
    Query query = new Query(Criteria.where("metadata.projectName").is(projectName));
    List<GridFSFile> files = new ArrayList<>();
    gridFsTemplate.find(query).into(files);
    return files;
  }

  public void deleteFile(String fileId) {
    Query query = new Query(Criteria.where("_id").is(new ObjectId(fileId)));
    gridFsTemplate.delete(query);
    log.info("Deleted file with ID {} from GridFS", fileId);
  }

  public void deleteProjectFiles(String projectName) {
    Query query = new Query(Criteria.where("metadata.projectName").is(projectName));
    gridFsTemplate.delete(query);
    log.info("Deleted all files for project '{}' from GridFS", projectName);
  }

  public boolean fileExists(String fileId) {
    GridFSFile file =
        gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new ObjectId(fileId))));
    return file != null;
  }
}
