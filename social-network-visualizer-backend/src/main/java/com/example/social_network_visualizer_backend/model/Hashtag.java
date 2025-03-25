package com.example.social_network_visualizer_backend.model;




import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("Hashtag")
@Data
@Builder
@AllArgsConstructor
public class Hashtag {

    @Id
    private String hashtag;

    @Relationship(type = "HAS_HASHTAG", direction = Relationship.Direction.INCOMING)
    private List<Tweet> tweetList;

    public void addTweet(Tweet tweet) {
        tweetList.add(tweet);
    }

}
