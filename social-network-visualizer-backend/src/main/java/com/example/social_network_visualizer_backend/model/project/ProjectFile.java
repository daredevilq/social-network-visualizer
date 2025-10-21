package com.example.social_network_visualizer_backend.model.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectFile {
  private String filename;
  private String gridFsId;
  private long sizeInBytes;
}
