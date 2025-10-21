package com.example.social_network_visualizer_backend.enums;

import lombok.Getter;

@Getter
public enum NodeType {
  AUTHOR("Author"),
  TWEET("Tweet"),
  HASHTAG("Hashtag");

  private final String label;

  NodeType(String label) {
    this.label = label;
  }

}
