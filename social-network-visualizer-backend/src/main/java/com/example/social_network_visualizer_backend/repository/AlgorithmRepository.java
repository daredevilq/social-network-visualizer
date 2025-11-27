package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.model.Author;
import java.util.List;
import java.util.Set;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface AlgorithmRepository extends Neo4jRepository<Author, String> {
  @Query(
      """
                CALL gds.pageRank.write($graphName, {
                    writeProperty: 'pagerank'
                }) YIELD nodePropertiesWritten
                RETURN 1
            """)
  void computePageRank(@Param("graphName") String graphName);

  @Query(
      """
                CALL gds.labelPropagation.write($graphName, {
                    writeProperty: 'community'
                }) YIELD communityCount
                RETURN 1
            """)
  void createCommunities(@Param("graphName") String graphName);

  @Query(
      """
    MATCH (source {id: $sourceId}), (target {id: $targetId})
    CALL gds.shortestPath.dijkstra.stream($graphName, {
        sourceNode: id(source),
        targetNode: id(target)
    })
    YIELD nodeIds
    UNWIND nodeIds AS nodeId
    MATCH (n) WHERE id(n) = nodeId

    RETURN
        n.id AS id,
        CASE
            WHEN n:Author THEN n.userName
            WHEN n:Tweet THEN n.contentPreview
            WHEN n:Hashtag THEN n.hashtag
        END AS name,
        CASE
            WHEN n:Author THEN 'AUTHOR'
            WHEN n:Tweet THEN 'TWEET'
            WHEN n:Hashtag THEN 'HASHTAG'
        END AS nodeType
    """)
  List<NodeDto> computeShortestPath(
      @Param("graphName") String graphName,
      @Param("sourceId") String sourceId,
      @Param("targetId") String targetId);

  @Query(
      """
          CALL gds.bridges.stream($graphName)
          YIELD from, to

          MATCH (s)-[r]-(t)
          WHERE id(s) = from AND id(t) = to AND type(r) IN $relationTypes

          RETURN
              s.id AS source,
              t.id AS target,
              type(r) AS relation,
              r.weight AS weight
          """)
  List<LinkDto> computeFindBridges(
      @Param("graphName") String graphName,
      @Param("relationTypes") Set<RelationType> relationTypes);
}
