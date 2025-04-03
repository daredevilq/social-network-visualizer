package com.example.social_network_visualizer_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

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

    @JsonManagedReference
    @Relationship(type = "POSTED", direction = Relationship.Direction.OUTGOING)
    private List<Tweet> tweetList;

    public void addTweet(Tweet tweet) {
        tweetList.add(tweet);
    }
}