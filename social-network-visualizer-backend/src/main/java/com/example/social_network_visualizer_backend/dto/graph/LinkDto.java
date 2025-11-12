package com.example.social_network_visualizer_backend.dto.graph;

import com.example.social_network_visualizer_backend.enums.RelationType;
import java.util.HashMap;
import java.util.Map;

public record LinkDto(String source, String target, RelationType relation) {

  public Map<String, String> convertToMap() {
    Map<String, String> map = new HashMap<>();
    map.put("source", this.source());
    map.put("target", this.target());
    map.put("relation", this.relation().toString());
    return map;
  }
}
