package com.example.social_network_visualizer_backend.model;

import lombok.*;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.time.LocalDateTime;
import java.util.List;

@Node("Tweet")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Tweet {

    @Id
    private String id;
    private LocalDateTime objectCreatedAt;
    private LocalDateTime publicationDate;
    private String objectType;
    private String language;
    private String contentPreview;
    private String content;
    private String twitterId;
    private String url;
    private String conversationId;
    private List<String> links;
    private List<String> photos;
    private List<String> videos;
    private Long repliesCount;
    private Long retweetsCount;
    private Long likesCount;
}
