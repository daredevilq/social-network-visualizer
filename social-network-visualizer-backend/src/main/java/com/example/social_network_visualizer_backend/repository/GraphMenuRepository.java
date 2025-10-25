package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.model.Author;
import java.util.Optional;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface GraphMenuRepository extends Neo4jRepository<Author, String> {
  @Query(
      """
       MATCH (a:Author)-[:POSTED]->(t:Tweet)
       WHERE t.id = $tweetId
       RETURN
           a.userName AS id,
           'AUTHOR' AS nodeType
       """)
  Optional<AuthorNodeDto> getTweetAuthor(@Param("tweetId") String tweetId);
}
