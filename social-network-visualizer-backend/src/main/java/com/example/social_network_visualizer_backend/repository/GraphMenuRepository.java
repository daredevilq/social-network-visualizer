package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

public interface GraphMenuRepository extends Neo4jRepository<Author, String> {

  @Query(
      """
                MATCH (a:Author {userName: $authorId})-[:POSTED]->(t:Tweet)
                WITH t
                ORDER BY t.publicationDate DESC
                LIMIT $numberOfTweets
                SET t.isInWorkspace = true
                RETURN count(t) as addedCount
            """)
  void addAuthorsLatestTweetsToWorkspace(String authorId, int numberOfTweets);
}
