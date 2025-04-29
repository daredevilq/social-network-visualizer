package com.example.social_network_visualizer_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Author")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Author {
    private String id;
    @Id
    private String userName;
    private String displayName;
    private String name;
    private String foreignId;
    private Boolean bot;

    private Double pagerank;
    private Double degreeCentrality;
    private Integer community;
}