package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuthorRepository extends Neo4jRepository<Author, String> {

    @Query("""
        MATCH (author:Author {userName: $userName})-[:POSTED]->(tweet:Tweet)
        RETURN tweet {
            .*,
            author: {
                id: author.id,
                userName: author.userName,
                displayName: author.displayName,
                name: author.name,
                foreignId: author.foreignId
            }
        }
        ORDER BY tweet.publicationDate DESC
        LIMIT 10
    """)
    List<Tweet> findTop10TweetsByAuthorUsername(@Param("userName") String userName);
}

