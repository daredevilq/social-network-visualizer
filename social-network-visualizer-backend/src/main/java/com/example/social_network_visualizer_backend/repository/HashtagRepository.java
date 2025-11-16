package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagFrequency;
import com.example.social_network_visualizer_backend.dto.hashtag.HashtagProfileDto;
import com.example.social_network_visualizer_backend.model.Hashtag;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
                        OPTIONAL MATCH (h)-[r]-()
                        WITH h, count(r) AS relationshipCount
                        ORDER BY relationshipCount DESC
                        LIMIT $limit
                        RETURN
                        h.hashtag AS id,
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
                        LIMIT $limit
                    """)
  List<TopAuthorsDto> findTopAuthorsByHashtag(
      @Param("hashtag") String hashtag, @Param("limit") int limit);

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
                       LIMIT $limit
                    """)
  List<ViralTweetDto> findTopTweetsByHashtag(
      @Param("hashtag") String hashtag, @Param("limit") int limit);

  @Query(
      """
            MATCH (h:Hashtag)
            WHERE h.hashtag IN $ids
            RETURN
                h.hashtag AS id,
                'HASHTAG' AS nodeType
            """)
  List<HashtagNodeDto> findFullHashtagNodesByIds(@Param("ids") Set<String> ids);

  @Query(
      """
                MATCH (h:Hashtag {hashtag: $hashtag})
                OPTIONAL MATCH (h)<-[:HAS_HASHTAG]-(t:Tweet)
                OPTIONAL MATCH (t)<-[:POSTED]-(a:Author)
                WITH h,
                     COUNT(DISTINCT t) AS tweets,
                     COUNT(DISTINCT a) AS uniqueUsers,
                     SUM(t.likesCount) AS totalLikes,
                     SUM(t.retweetsCount) AS totalRetweets,
                     MIN(t.publicationDate) AS firstUsed,
                     MAX(t.publicationDate) AS lastUsed,
                     SUM(t.repliesCount) AS totalReplies,
                     COUNT(DISTINCT t.language) AS distinctLanguages
                RETURN
                     h.hashtag AS name,
                     tweets AS totalUsage,
                     uniqueUsers,
                     totalLikes,
                     totalRetweets,
                     firstUsed,
                     lastUsed,
                     totalReplies,
                     distinctLanguages
            """)
  HashtagProfileDto findHashtagProfile(String hashtag);

  @Query(
      """
                      MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag {hashtag: $hashtag})
                      WITH t, h
                      RETURN datetime(t.publicationDate) AS activityDate
                      ORDER BY activityDate DESC
                  """)
  List<ZonedDateTime> getHashtagActivity(@Param("hashtag") String hashtag);

  @Query(
      """
                      MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag {hashtag: $hashtagName})
                      WHERE size(t.content) > 1
                      RETURN t.content
                  """)
  List<String> findTweetsContentByHashtag(String hashtagName);
}
