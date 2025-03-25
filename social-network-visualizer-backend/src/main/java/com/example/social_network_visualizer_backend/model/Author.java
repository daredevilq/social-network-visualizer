package com.example.social_network_visualizer_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("Author")
@Data
@Builder
@AllArgsConstructor
public class Author {
    @Id
    private String id;
    private String userName;
    private String displayName;
    private String name;
    private String foreignId;
    private Boolean bot;

    @Relationship(type = "POSTED", direction = Relationship.Direction.OUTGOING)
    private List<Tweet> tweetList;

    public void addTweet(Tweet tweet) {
        tweetList.add(tweet);
    }
}