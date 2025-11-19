package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.model.Hashtag;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface HashtagRepository extends Neo4jRepository<Hashtag, String> {
  @Query(
      """
                UNWIND $hashtags AS hashtag
                CREATE (h:Hashtag {
                    id: hashtag.id,
                    hashtag: hashtag.hashtag,
                    isInWorkspace: hashtag.isInWorkspace
                })
            """)
  void createAll(@Param("hashtags") List<Map<String, Object>> hashtags);

  @Query(
      """
                UNWIND $hashtags AS hashtag
                MERGE (h:Hashtag { hashtag: hashtag.hashtag })
                ON CREATE SET h.id = hashtag.id, h.isInWorkspace = hashtag.isInWorkspace
            """)
  void mergeAll(@Param("hashtags") List<Map<String, Object>> hashtags);

  @Query("CREATE CONSTRAINT IF NOT EXISTS FOR (h:Hashtag) REQUIRE h.hashtag IS UNIQUE")
  void createHashtagConstraint();

  @Query(
      """
                MATCH (h:Hashtag)
                WHERE $inWorkspace = false OR h.isInWorkspace = true
                OPTIONAL MATCH (h)-[r]-()
                WITH h, count(r) AS relationshipCount
                ORDER BY relationshipCount DESC
                LIMIT $limit
                RETURN
                h.id AS id,
                h.hashtag AS name,
                'HASHTAG' AS nodeType
            """)
  List<HashtagNodeDto> findHashtag(
      @Param("inWorkspace") boolean inWorkspace, @Param("limit") int limit);

  @Query(
      """
                MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
                RETURN h.hashtag AS name, count(*) AS frequency
                ORDER BY frequency DESC
                LIMIT 20
            """)
  List<HashtagFrequency> findTopHashtags();

  @Query(
      """
                  MATCH (a:Author)-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
                  WHERE h.hashtag = $hashtag
                  WITH a, COUNT(t) AS count
                  RETURN a.userName AS username, count
                  ORDER BY count DESC
                  LIMIT 7
              """)
  List<TopAuthorsDto> findTopUsersByHashtag(@Param("hashtag") String hashtag);

  @Query(
      """
                 MATCH (a:Author)-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
                 WHERE h.hashtag = $hashtag
                 WITH a, t,
                      t.likesCount AS likes,
                      t.retweetsCount AS retweets,
                      t.repliesCount AS replies,
                      (t.likesCount + t.retweetsCount + t.repliesCount) AS engagementScore
                 RETURN
                     a.userName AS userName,
                     t.id AS tweetId,
                     t.contentPreview AS preview,
                     t.url AS tweetUrl,
                     likes,
                     retweets,
                     replies,
                     engagementScore
                 ORDER BY engagementScore DESC
                 LIMIT 3
              """)
  List<ViralTweetDto> findTopTweetsByHashtag(@Param("hashtag") String hashtag);

  @Query(
      """
      MATCH (h:Hashtag)
      WHERE h.id IN $ids
      RETURN
          h.id as id,
          h.hashtag AS name,
          'HASHTAG' AS nodeType
      """)
  List<HashtagNodeDto> findFullHashtagNodesByIds(@Param("ids") Set<String> ids);

  @Query(
      """
                    MATCH (h:Hashtag)
                    WHERE h.hashtag = $hashtag
                    RETURN h
                """)
  Optional<Hashtag> findHashtagByHashtag(@Param("hashtag") String hashtag);
}
