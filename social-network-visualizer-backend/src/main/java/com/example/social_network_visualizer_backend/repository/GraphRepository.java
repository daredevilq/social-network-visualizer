package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface GraphRepository extends Neo4jRepository<Author, String> {

    @Query("""
        MATCH (node)
        DETACH DELETE node
    """)
    void deleteAllNodes();

    @Query("""
      CALL gds.graph.project(
        $graphName,
        'Author',
        {
          MENTIONS: { type: 'MENTIONS', orientation: 'NATURAL' }
        }
      )
      YIELD graphName
      RETURN graphName
    """)
    void createGraphMentions(@Param("graphName") String graphName);

    @Query("""
      CALL gds.graph.project(
        $graphName,
        'Author',
        {
          RETWEET: { type: 'RETWEETS', orientation: 'NATURAL' },
          MENTIONS: { type: 'MENTIONS', orientation: 'NATURAL' }
        }
      )
      YIELD graphName
      RETURN graphName
    """)
    void createGraphRetweetsMentions(@Param("graphName") String graphName);

    @Query("""
        CALL gds.graph.drop($graphName, false) YIELD graphName
        RETURN graphName
    """)
    void dropGdsGraph(@Param("graphName") String graphName);
}
