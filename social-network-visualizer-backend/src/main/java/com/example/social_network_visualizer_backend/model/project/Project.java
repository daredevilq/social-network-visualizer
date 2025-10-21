package com.example.social_network_visualizer_backend.model.project;

import java.util.List;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "projects")
@Data
@Builder
public class Project {
  @Id private String id;
  private String name;
  private ProjectConfig config;
  private List<ProjectFile> files;
  private List<Workspace> workspaces;
}
