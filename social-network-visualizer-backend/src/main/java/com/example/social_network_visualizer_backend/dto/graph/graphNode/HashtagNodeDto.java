package com.example.social_network_visualizer_backend.dto.graph.graphNode;

import com.example.social_network_visualizer_backend.enums.NodeType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class HashtagNodeDto extends NodeDto {
    private String name;
    private NodeType nodeType;
}