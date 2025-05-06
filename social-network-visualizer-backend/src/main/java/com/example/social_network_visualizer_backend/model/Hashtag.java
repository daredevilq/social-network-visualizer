package com.example.social_network_visualizer_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Hashtag")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Hashtag {

    @Id
    private String hashtag;
}
