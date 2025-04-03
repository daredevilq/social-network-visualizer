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

@Node("Hashtag")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Hashtag {

    @Id
    private String hashtag;

    @JsonBackReference
    @Relationship(type = "HAS_HASHTAG", direction = Relationship.Direction.INCOMING)
    private List<Tweet> tweetList;

    public void addTweet(Tweet tweet) {
        tweetList.add(tweet);
    }

}
