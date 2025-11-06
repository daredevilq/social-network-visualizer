package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.model.Author;
import java.util.List;
import java.util.Map;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface GraphRepository extends Neo4jRepository<Author, String> {

  @Query("""
                MATCH (node)
                DETACH DELETE node
            """)
  void deleteAllNodes();

  @Query(
      """
              CALL gds.graph.project(
                $graphName,
                $nodeLabels,
                $relations
              )
              YIELD graphName
              RETURN graphName
            """)
  void createGraph(
      @Param("graphName") String graphName,
      @Param("nodeLabels") List<String> nodeLabels,
      @Param("relations") Map<String, Map<String, String>> relations);

  @Query(
      """
                CALL gds.graph.drop($graphName, false) YIELD graphName
                RETURN graphName
            """)
  void dropGdsGraph(@Param("graphName") String graphName);

  @Query(
      """
                MATCH (a1:Author)-[r]->(a2:Author)
                RETURN a1.userName AS source, a2.userName AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (a:Author)-[r]->(t:Tweet)
                RETURN a.userName AS source, t.id AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (t:Tweet)-[r]->(h:Hashtag)
                RETURN t.id AS source, h.hashtag AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (t1:Tweet)-[r]->(t2:Tweet)
                RETURN t1.id AS source, t2.id AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (a:Author)-[r]->(h:Hashtag)
                RETURN a.userName AS source, h.hashtag AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight
            """)
  List<LinkDto> findAllRelations();

  @Query(
      """

                MATCH (a1:Author)-[r]->(a2:Author)
                WHERE a1.isInWorkspace = true AND a2.isInWorkspace = true
                RETURN a1.userName AS source, a2.userName AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (a:Author)-[r]->(t:Tweet)
                WHERE a.isInWorkspace = true AND t.isInWorkspace = true
                RETURN a.userName AS source, t.id AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (t:Tweet)-[r]->(h:Hashtag)
                WHERE t.isInWorkspace = true AND h.isInWorkspace = true
                RETURN t.id AS source, h.hashtag AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (t1:Tweet)-[r]->(t2:Tweet)
                WHERE t1.isInWorkspace = true AND t2.isInWorkspace = true
                RETURN t1.id AS source, t2.id AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight

                UNION

                MATCH (a:Author)-[r]->(h:Hashtag)
                WHERE a.isInWorkspace = true AND h.isInWorkspace = true
                RETURN a.userName AS source, h.hashtag AS target, type(r) AS relation, COALESCE(r.weight, 1) AS weight
            """)
  List<LinkDto> findWorkspaceRelationships();

  @Query(
      """
                CALL gds.graph.list() YIELD graphName
                RETURN graphName
            """)
  List<String> listGdsGraphs();

  @Query("""
    MATCH (n)
    WHERE n.isInWorkspace = true
    SET n.isInWorkspace = false
    """)
  void clearWorkspaceMembership();

  @Query(
      """
                MATCH (a:Author)
                WHERE toLower(a.userName) CONTAINS toLower($query)
                RETURN
                  a.userName AS id,
                  'AUTHOR' AS nodeType,
                  null AS content

                UNION

                MATCH (h:Hashtag)
                WHERE toLower(h.hashtag) CONTAINS toLower($query)
                RETURN
                  h.hashtag AS id,
                  'HASHTAG' AS nodeType,
                  null AS content

                UNION

                MATCH (t:Tweet)
                WHERE toLower(t.content) CONTAINS toLower($query)
                RETURN
                  t.id AS id,
                  'TWEET' AS nodeType,
                  t.content AS content
            """)
  List<NodeSearchDto> performSearch(@Param("query") String query);
}
