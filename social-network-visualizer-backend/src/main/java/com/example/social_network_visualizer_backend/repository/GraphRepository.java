package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface GraphRepository extends Neo4jRepository<Author, String> {

    @Query("""
        MATCH (node)
        DETACH DELETE node
    """)
    void deleteAllNodes();

    @Query("""
      CALL gds.graph.project(
        $graphName,
        $nodeLabels,
        $relations
      )
      YIELD graphName
      RETURN graphName
    """)
    void createGraph(@Param("graphName") String graphName, @Param("nodeLabels") List<String> nodeLabels, @Param("relations") Map<String, Map<String, String>> relations);

    @Query("""
        CALL gds.graph.drop($graphName, false) YIELD graphName
        RETURN graphName
    """)
    void dropGdsGraph(@Param("graphName") String graphName);


    @Query("""
        CALL gds.graph.exists($graphName)
        YIELD exists
        RETURN exists
    """)
    Boolean checkIfGraphExists(@Param("graphName") String graphName);

}
