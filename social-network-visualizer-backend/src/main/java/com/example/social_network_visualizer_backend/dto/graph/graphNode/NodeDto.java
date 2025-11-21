package com.example.social_network_visualizer_backend.dto.graph.graphNode;

import com.example.social_network_visualizer_backend.enums.NodeType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "nodeType",
    visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = AuthorNodeDto.class, name = "AUTHOR"),
  @JsonSubTypes.Type(value = TweetNodeDto.class, name = "TWEET"),
  @JsonSubTypes.Type(value = HashtagNodeDto.class, name = "HASHTAG")
})
public class NodeDto {
  private String id;
  private String name;
  private NodeType nodeType;

  public Map<String, String> convertToMap() {
    Map<String, String> map = new HashMap<>();
    map.put("id", this.getId());
    map.put("name", this.getName());
    map.put("nodeType", this.getNodeType().toString());
    return map;
  }
}
