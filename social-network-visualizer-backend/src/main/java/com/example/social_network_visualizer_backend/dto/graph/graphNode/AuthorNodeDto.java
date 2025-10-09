package com.example.social_network_visualizer_backend.dto.graph.graphNode;

import com.example.social_network_visualizer_backend.enums.NodeType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthorNodeDto extends NodeDto {
    private String name;
    private NodeType nodeType;
    private Double pagerank;
    private Double centrality;
    private Integer community;
}
