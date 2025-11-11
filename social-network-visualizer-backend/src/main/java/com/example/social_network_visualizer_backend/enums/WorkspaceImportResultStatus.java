package com.example.social_network_visualizer_backend.enums;

import lombok.Getter;

@Getter
public enum WorkspaceImportResultStatus {
  SUCCESS("success"),
  ERROR("error"),
  WARNING("warning");

  private final String label;

  WorkspaceImportResultStatus(String label) {
    this.label = label;
  }
}
