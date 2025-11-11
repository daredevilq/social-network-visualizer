package com.example.social_network_visualizer_backend.dto.graph.graphNode;

import com.example.social_network_visualizer_backend.enums.NodeType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
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
  private NodeType nodeType;
}
