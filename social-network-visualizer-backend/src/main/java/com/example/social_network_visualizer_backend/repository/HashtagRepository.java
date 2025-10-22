package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.model.Hashtag;
import java.util.List;
import java.util.Map;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface HashtagRepository extends Neo4jRepository<Hashtag, String> {
  @Query(
      """
                UNWIND $hashtags AS hashtag
                CREATE (h:Hashtag {
                    hashtag: hashtag.hashtag,
                    isInWorkspace: hashtag.isInWorkspace
                })
            """)
  void createAll(@Param("hashtags") List<Map<String, Object>> hashtags);

  @Query(
      """
                UNWIND $hashtags AS hashtag
                MERGE (h:Hashtag { hashtag: hashtag.hashtag })
            """)
  void mergeAll(@Param("hashtags") List<Map<String, Object>> hashtags);

  @Query("CREATE CONSTRAINT IF NOT EXISTS FOR (h:Hashtag) REQUIRE h.hashtag IS UNIQUE")
  void createHashtagConstraint();

  @Query(
      """
                MATCH (h:Hashtag)
                WHERE $inWorkspace = false OR h.isInWorkspace = true
                RETURN
                h.hashtag AS id,
                'HASHTAG' AS nodeType
                ORDER BY h.hashtag
            """)
  List<HashtagNodeDto> findHashtag(@Param("inWorkspace") boolean inWorkspace);

  @Query(
      """
                MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
                RETURN h.hashtag AS name, count(*) AS frequency
                ORDER BY frequency DESC
                LIMIT 20
            """)
  List<HashtagFrequency> findTopHashtags();
}
