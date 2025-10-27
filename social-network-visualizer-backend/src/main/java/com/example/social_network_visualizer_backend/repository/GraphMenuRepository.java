package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.model.Author;
import java.util.List;
import java.util.Optional;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

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

  @Query(
      """
           MATCH (a:Author)-[:POSTED]->(t:Tweet)
           WHERE t.id = $tweetId
           RETURN
               a.userName AS id,
               'AUTHOR' AS nodeType
           """)
  Optional<AuthorNodeDto> findAuthorByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
           MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
           WHERE t.id = $tweetId
           RETURN
               h.hashtag AS id,
               'HASHTAG' AS nodeType
           """)
  List<HashtagNodeDto> findHashtagsByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
           MATCH (t:Tweet)-[:MENTION]->(a:Author)
           WHERE t.id = $tweetId
           RETURN
               a.userName AS id,
               'AUTHOR' AS nodeType
           """)
  List<AuthorNodeDto> findMentionedAuthorsByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (a:Author)-[:USES_HASHTAG]->(h:Hashtag {hashtag: $hashtagName})
          WITH a, COUNT(*) AS usesCount
          ORDER BY usesCount DESC
          LIMIT 5
          RETURN
              a.userName AS id,
              'AUTHOR' AS nodeType
          """)
  List<AuthorNodeDto> findTopAuthorsByHashtagId(@Param("hashtagName") String hashtagId);

  @Query(
      """
          MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag {hashtag: $hashtagName})
          WITH t, h,
              COALESCE(t.likesCount, 0) +
              COALESCE(t.repliesCount, 0) +
              COALESCE(t.retweetsCount, 0) AS score
          ORDER BY score DESC
          LIMIT 5
          RETURN
              t.id AS id,
              'TWEET' AS nodeType
          """)
  List<TweetNodeDto> findTopTweetsByHashtagId(@Param("hashtagName") String hashtagId);
}
