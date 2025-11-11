package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.NodeSearchDto;
import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
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
                RETURN a1.userName AS source, a2.userName AS target, type(r) AS relation

                UNION

                MATCH (a:Author)-[r]->(t:Tweet)
                RETURN a.userName AS source, t.id AS target, type(r) AS relation

                UNION

                MATCH (t:Tweet)-[r]->(h:Hashtag)
                RETURN t.id AS source, h.hashtag AS target, type(r) AS relation

                UNION

                MATCH (t1:Tweet)-[r]->(t2:Tweet)
                RETURN t1.id AS source, t2.id AS target, type(r) AS relation

                UNION

                MATCH (a:Author)-[r]->(h:Hashtag)
                RETURN a.userName AS source, h.hashtag AS target, type(r) AS relation
            """)
  List<LinkDto> findAllRelations();

  @Query(
      """

                MATCH (a1:Author)-[r]->(a2:Author)
                WHERE a1.isInWorkspace = true AND a2.isInWorkspace = true
                RETURN a1.userName AS source, a2.userName AS target, type(r) AS relation

                UNION

                MATCH (a:Author)-[r]->(t:Tweet)
                WHERE a.isInWorkspace = true AND t.isInWorkspace = true
                RETURN a.userName AS source, t.id AS target, type(r) AS relation

                UNION

                MATCH (t:Tweet)-[r]->(h:Hashtag)
                WHERE t.isInWorkspace = true AND h.isInWorkspace = true
                RETURN t.id AS source, h.hashtag AS target, type(r) AS relation

                UNION

                MATCH (t1:Tweet)-[r]->(t2:Tweet)
                WHERE t1.isInWorkspace = true AND t2.isInWorkspace = true
                RETURN t1.id AS source, t2.id AS target, type(r) AS relation

                UNION

                MATCH (a:Author)-[r]->(h:Hashtag)
                WHERE a.isInWorkspace = true AND h.isInWorkspace = true
                RETURN a.userName AS source, h.hashtag AS target, type(r) AS relation
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
                WHERE toLower(a.userName) CONTAINS toLower($query) OR 'author' CONTAINS toLower($query)
                RETURN
                  a.userName AS id,
                  'AUTHOR' AS nodeType,
                  null AS content

                UNION

                MATCH (h:Hashtag)
                WHERE toLower(h.hashtag) CONTAINS toLower($query) OR 'hashtag' CONTAINS toLower($query)
                RETURN
                  h.hashtag AS id,
                  'HASHTAG' AS nodeType,
                  null AS content

                UNION

                MATCH (t:Tweet)
                WHERE toLower(t.content) CONTAINS toLower($query) OR 'tweet' CONTAINS toLower($query)
                RETURN
                  t.id AS id,
                  'TWEET' AS nodeType,
                  t.content AS content
            """)
  List<NodeSearchDto> performSearch(@Param("query") String query);

  @Query(
      """
                UNWIND $edges AS edge
                OPTIONAL MATCH (source:Author {userName: edge.source})
                OPTIONAL MATCH (source2:Tweet {id: edge.source})
                OPTIONAL MATCH (source3:Hashtag {hashtag: edge.source})
                WITH edge, COALESCE(source, source2, source3) AS sourceNode

                OPTIONAL MATCH (target:Author {userName: edge.target})
                OPTIONAL MATCH (target2:Tweet {id: edge.target})
                OPTIONAL MATCH (target3:Hashtag {hashtag: edge.target})
                WITH edge, sourceNode, COALESCE(target, target2, target3) AS targetNode

                WHERE sourceNode IS NOT NULL AND targetNode IS NOT NULL
                OPTIONAL MATCH (sourceNode)-[r]->(targetNode)
                WHERE type(r) = edge.relation

                WITH edge, r
                WHERE r IS NOT NULL
                RETURN edge.source AS source, edge.target AS target, edge.relation AS relation
            """)
  List<LinkDto> findExistingRelations(@Param("edges") List<Map<String, String>> edges);

  @Query(
      """
                UNWIND $nodes AS node
                WITH node.id AS nodeId, node.nodeType AS nodeType
                OPTIONAL MATCH (a:Author {userName: nodeId})
                WHERE nodeType = 'AUTHOR' AND a IS NOT NULL
                WITH nodeId, nodeType, a.userName AS authorId
                OPTIONAL MATCH (t:Tweet {id: nodeId})
                WHERE nodeType = 'TWEET' AND t IS NOT NULL
                WITH nodeId, nodeType, authorId, t.id AS tweetId
                OPTIONAL MATCH (h:Hashtag {hashtag: nodeId})
                WHERE nodeType = 'HASHTAG' AND h IS NOT NULL
                WITH COALESCE(authorId, tweetId, h.hashtag) AS id, nodeType
                WHERE id IS NOT NULL
                RETURN id, nodeType
            """)
  List<NodeDto> findExistingNodesByIdsAndTypes(@Param("nodes") List<Map<String, String>> nodes);
}
