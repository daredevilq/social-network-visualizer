package com.example.social_network_visualizer_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("Cashtag")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cashtag {

    @Id
    private String cashtag;

    @JsonBackReference
    @Relationship(type = "HAS_CASHTAG", direction = Relationship.Direction.INCOMING)
    private List<Tweet> tweetList;

    public void addTweet(Tweet tweet) {
        tweetList.add(tweet);
    }
}
