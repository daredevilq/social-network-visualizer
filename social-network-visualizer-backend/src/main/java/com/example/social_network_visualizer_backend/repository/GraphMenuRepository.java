package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.model.Author;
import java.util.List;
import java.util.Optional;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface GraphMenuRepository extends Neo4jRepository<Author, String> {
  @Query(
      """
          MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(t:Tweet)
          WHERE t.isInWorkspace = false
          OPTIONAL MATCH (author:Author)-[:POSTED]->(t)
          ORDER BY t.publicationDate DESC
          LIMIT $numberOfTweets
          RETURN
              t.id AS id,
              t.contentPreview as name,
              'TWEET' AS nodeType
          """)
  List<NodeDto> findAuthorLatestTweets(
      @Param("authorUserName") String authorUserName, @Param("numberOfTweets") int numberOfTweets);

  @Query(
      """
        MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(t:Tweet)
        WHERE t.isInWorkspace = false
        OPTIONAL MATCH (author:Author)-[:POSTED]->(t)
        WITH t, author, (COALESCE(t.likesCount, 0) + COALESCE(t.repliesCount, 0) + COALESCE(t.retweetsCount, 0)) AS popularityScore
        ORDER BY popularityScore DESC
        LIMIT $numberOfTweets
        RETURN
            t.id AS id,
            t.contentPreview as name,
            'TWEET' AS nodeType
        """)
  List<NodeDto> findAuthorMostPopularTweets(
      @Param("authorUserName") String authorUserName, @Param("numberOfTweets") int numberOfTweets);

  @Query(
      """
          MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
          WHERE h.isInWorkspace = false
          WITH h, COUNT(*) AS freq
          ORDER BY freq DESC
          LIMIT 5
          RETURN
              h.id as id,
              h.hashtag AS name,
              'HASHTAG' AS nodeType
          """)
  List<NodeDto> findHashtagsUsedByAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
          MATCH (a:Author)-[:POSTED]->(:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
          WHERE a.userName IN $authorUserNames
            AND (h.isInWorkspace IS NULL OR h.isInWorkspace = false)
          WITH h, COLLECT(DISTINCT a.userName) AS authorsUsing
          WHERE SIZE(authorsUsing) > 1
          RETURN
              h.id as id,
              h.hashtag AS name,
              'HASHTAG' AS nodeType,
              SIZE(authorsUsing) AS authorCount
          ORDER BY authorCount DESC
          LIMIT 10
          """)
  List<NodeDto> findTopCommonHashtagsUsedByAuthors(
      @Param("authorUserNames") List<String> authorUserNames);

  @Query(
      """
          MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(t:Tweet)-[:MENTION]->(mentioned:Author)
          WHERE mentioned.isInWorkspace = false
          WITH mentioned, COUNT(*) AS mentions
          ORDER BY mentions DESC
          LIMIT 10
          RETURN
              mentioned.id as id,
              mentioned.userName AS name,
              'AUTHOR' AS nodeType
          """)
  List<NodeDto> findMentionedUsersByAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
      MATCH (mentioning:Author)-[:POSTED]->(:Tweet)-[:MENTION]->(a:Author {userName: $authorUserName})
      WHERE mentioning.isInWorkspace = false
      WITH mentioning, COUNT(*) AS mentionsCount
      ORDER BY mentionsCount DESC
      LIMIT 10
      RETURN
          mentioning.id as id,
          mentioning.userName AS name,
          'AUTHOR' AS nodeType
      """)
  List<NodeDto> findAuthorsMentioningThisAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
      MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(reply:Tweet)-[:HAS_PARENT]->(parent:Tweet)<-[:POSTED]-(other:Author)
      WHERE other.isInWorkspace = false
      WITH other, COUNT(reply) AS replyCount
      ORDER BY replyCount DESC
      LIMIT 10
      RETURN
          other.id as id,
          other.userName AS name,
          'AUTHOR' AS nodeType
      """)
  List<NodeDto> findAuthorsMostRepliedToByAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
      MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(parent:Tweet)<-[:HAS_PARENT]-(reply:Tweet)<-[:POSTED]-(other:Author)
      WHERE other.isInWorkspace = false
      WITH other, COUNT(reply) AS replyCount
      ORDER BY replyCount DESC
      LIMIT 10
      RETURN
          other.id as id,
          other.userName AS name,
          'AUTHOR' AS nodeType
      """)
  List<NodeDto> findAuthorsMostReplyingToAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
          MATCH (a:Author {userName: $authorUserName})-[:POSTED]->(reply:Tweet)-[:HAS_PARENT]->(parent:Tweet)
          WHERE parent.isInWorkspace = false
          ORDER BY parent.publicationDate DESC
          LIMIT 10
          RETURN
              parent.id AS id,
              parent.contentPreview as name,
              'TWEET' AS nodeType
          """)
  List<NodeDto> findTweetsRepliedToByAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
          MATCH (t:Tweet)-[:MENTION]->(a:Author {userName: $authorUserName})
          WHERE t.isInWorkspace = false
          ORDER BY t.publicationDate DESC
          RETURN
              t.id AS id,
              t.contentPreview as name,
              'TWEET' AS nodeType
          LIMIT 10
          """)
  List<NodeDto> findTweetsMentioningAuthor(@Param("authorUserName") String authorUserName);

  @Query(
      """
           MATCH (a:Author)-[:POSTED]->(t:Tweet {id: $tweetId})
           RETURN
               a.id as id,
               a.userName AS name,
               'AUTHOR' AS nodeType
           """)
  Optional<NodeDto> findAuthorByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
           MATCH (t:Tweet {id: $tweetId})-[:HAS_HASHTAG]->(h:Hashtag)
           WHERE h.isInWorkspace = false
           RETURN
               h.id as id,
               h.hashtag AS name,
               'HASHTAG' AS nodeType
           """)
  List<NodeDto> findHashtagsByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
              MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
              WHERE t.id IN $tweetIds
                AND (h.isInWorkspace IS NULL OR h.isInWorkspace = false)
              WITH h, COLLECT(DISTINCT t.id) AS tweetUsing
              WHERE SIZE(tweetUsing) > 1
              RETURN
                  h.id as id,
                  h.hashtag AS name,
                  'HASHTAG' AS nodeType,
                  SIZE(tweetUsing) AS tweetCount
              ORDER BY tweetCount DESC
              LIMIT 10
              """)
  List<NodeDto> findCommonHashtagsByTweetIds(@Param("tweetIds") List<String> tweetIds);

  @Query(
      """
           MATCH (t:Tweet {id: $tweetId})-[:MENTION]->(a:Author)
           WHERE a.isInWorkspace = false
           RETURN
               a.id as id,
               a.userName AS name,
               'AUTHOR' AS nodeType
           """)
  List<NodeDto> findMentionedAuthorsByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (t:Tweet {id: $tweetId})-[:HAS_PARENT]->(parent:Tweet)
          OPTIONAL MATCH (author:Author)-[:POSTED]->(parent)
          RETURN
              parent.id AS id,
              parent.contentPreview as name,
              'TWEET' AS nodeType
          LIMIT 1
          """)
  Optional<NodeDto> findParentByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (child:Tweet)-[:HAS_PARENT]->(t:Tweet {id: $tweetId})
          WHERE child.isInWorkspace = false
          RETURN
              child.id AS id,
              child.contentPreview as name,
              'TWEET' AS nodeType
          """)
  List<NodeDto> findChildrenByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (a:Author)-[:USES_HASHTAG]->(h:Hashtag {hashtag: $hashtag})
          WHERE a.isInWorkspace = false
          WITH a, COUNT(*) AS usesCount
          ORDER BY usesCount DESC
          LIMIT 5
          RETURN
              a.id as id,
              a.userName AS name,
              'AUTHOR' AS nodeType
          """)
  List<NodeDto> findTopAuthorsByHashtag(@Param("hashtag") String hashtag);

  @Query(
      """
          MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag {hashtag: $hashtag})
          WHERE t.isInWorkspace = false
          WITH t, h,
              COALESCE(t.likesCount, 0) +
              COALESCE(t.repliesCount, 0) +
              COALESCE(t.retweetsCount, 0) AS score
          ORDER BY score DESC
          LIMIT 5
          RETURN
              t.id AS id,
              t.contentPreview as name,
              'TWEET' AS nodeType
          """)
  List<NodeDto> findTopTweetsByHashtag(@Param("hashtag") String hashtag);

  @Query(
      """
        MATCH (h:Hashtag {hashtag: $hashtag})<-[:HAS_HASHTAG]-(t:Tweet)-[:HAS_HASHTAG]->(other:Hashtag)
        WHERE other.id <> $hashtag AND other.isInWorkspace = false
        WITH other, COUNT(t) AS occurrenceCount
        ORDER BY occurrenceCount DESC
        LIMIT 10
        RETURN
            other.id as id,
            other.hashtag AS name,
            'HASHTAG' AS nodeType
        """)
  List<NodeDto> findRelatedHashtags(@Param("hashtag") String hashtag);
}
