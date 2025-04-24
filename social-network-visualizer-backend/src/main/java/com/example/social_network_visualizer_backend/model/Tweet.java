package com.example.social_network_visualizer_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.Date;
import java.util.List;

@Node("Tweet")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Tweet {

    @Id
    private String id;
    private Date objectCreatedAt;
    private Date publicationDate;
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

    @JsonBackReference
    @Relationship(type = "POSTED", direction = Relationship.Direction.INCOMING)
    private Author author;

    @JsonManagedReference
    @Relationship(type = "HAS_HASHTAG", direction = Relationship.Direction.OUTGOING)
    private List<Hashtag> hashtags;

//    @JsonManagedReference
//    @Relationship(type = "HAS_CASHTAG", direction = Relationship.Direction.OUTGOING)
//    private List<Cashtag> cashtags;

    @JsonBackReference
    @Relationship(type = "HAS_REPLY", direction = Relationship.Direction.OUTGOING)
    private List<Author> replies;

    @JsonBackReference
    @Relationship(type = "MENTIONS", direction = Relationship.Direction.OUTGOING)
    private List<Author> mentions;

    @JsonBackReference
    @Relationship(type = "HAS_PARENT", direction = Relationship.Direction.OUTGOING)
    private Tweet parent;

}
