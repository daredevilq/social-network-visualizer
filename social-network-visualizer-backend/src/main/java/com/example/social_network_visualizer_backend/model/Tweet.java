package com.example.social_network_visualizer_backend.model;

import lombok.*;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Node("Tweet")
@Data
@Builder
@AllArgsConstructor
public class Tweet {

    @Id
    private String id;
    private Date objectCreatedAt;
    private Date publicationDate;
    private String language;
    private String contentPreview;
    private String content;
    private String twitterId;
    private String url;
    private String conversationId;
//    private List<Object> mentions;
//    private List<Object> replies;
    private List<String> links;
    private List<String> photos;
    private List<String> videos;
    private long repliesCount;
    private long retweetsCount;
    private long likesCount;

    @Relationship(type = "POSTED", direction = Relationship.Direction.INCOMING)
    private Author author;

    @Relationship(type = "HAS_HASHTAG", direction = Relationship.Direction.OUTGOING)
    private List<Hashtag> hashtags;

    @Relationship(type = "HAS_CASHTAG", direction = Relationship.Direction.OUTGOING)
    private List<Cashtag> cashtags;
}
