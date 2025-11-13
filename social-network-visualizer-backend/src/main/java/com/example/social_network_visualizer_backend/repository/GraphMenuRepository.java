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
          WHERE t.isInWorkspace = false
          WITH t
          ORDER BY t.publicationDate DESC
          LIMIT $numberOfTweets
          RETURN
              t.id AS id,
              'TWEET' AS nodeType
          """)
  List<TweetNodeDto> findAuthorLatestTweets(
      @Param("authorId") String authorId, @Param("numberOfTweets") int numberOfTweets);

  @Query(
      """
        MATCH (a:Author {userName: $authorId})-[:POSTED]->(t:Tweet)
        WHERE t.isInWorkspace = false
        WITH t, (COALESCE(t.likesCount, 0) + COALESCE(t.repliesCount, 0) + COALESCE(t.retweetsCount, 0)) AS popularityScore
        ORDER BY popularityScore DESC
        LIMIT $numberOfTweets
        RETURN
            t.id AS id,
            'TWEET' AS nodeType
        """)
  List<TweetNodeDto> findAuthorMostPopularTweets(
      @Param("authorId") String authorId, @Param("numberOfTweets") int numberOfTweets);

  @Query(
      """
          MATCH (a:Author {userName: $authorId})-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
          WHERE h.isInWorkspace = false
          WITH h, COUNT(*) AS freq
          ORDER BY freq DESC
          LIMIT 5
          RETURN
              h.hashtag AS id,
              'HASHTAG' AS nodeType
          """)
  List<HashtagNodeDto> findHashtagsUsedByAuthor(@Param("authorId") String authorId);

  @Query(
      """
          MATCH (a:Author)-[:POSTED]->(:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
          WHERE a.userName IN $authorIds
            AND (h.isInWorkspace IS NULL OR h.isInWorkspace = false)
          WITH h, COLLECT(DISTINCT a.userName) AS authorsUsing
          WHERE SIZE(authorsUsing) > 1
          RETURN
              h.hashtag AS id,
              'HASHTAG' AS nodeType,
              SIZE(authorsUsing) AS authorCount
          ORDER BY authorCount DESC
          LIMIT 10
          """)
  List<HashtagNodeDto> findTopCommonHashtagsUsedByAuthors(
      @Param("authorIds") List<String> authorIds);

  @Query(
      """
          MATCH (a:Author {userName: $authorId})-[:POSTED]->(t:Tweet)-[:MENTION]->(mentioned:Author)
          WHERE mentioned.isInWorkspace = false
          WITH mentioned, COUNT(*) AS mentions
          ORDER BY mentions DESC
          LIMIT 10
          RETURN
              mentioned.userName AS id,
              'AUTHOR' AS nodeType
          """)
  List<AuthorNodeDto> findMentionedUsersByAuthor(@Param("authorId") String authorId);

  @Query(
      """
      MATCH (mentioning:Author)-[:POSTED]->(:Tweet)-[:MENTION]->(a:Author {userName: $authorId})
      WHERE mentioning.isInWorkspace = false
      WITH mentioning, COUNT(*) AS mentionsCount
      ORDER BY mentionsCount DESC
      LIMIT 10
      RETURN
          mentioning.userName AS id,
          'AUTHOR' AS nodeType
      """)
  List<AuthorNodeDto> findAuthorsMentioningThisAuthor(@Param("authorId") String authorId);

  @Query(
      """
      MATCH (a:Author {userName: $authorId})-[:POSTED]->(reply:Tweet)-[:HAS_PARENT]->(parent:Tweet)<-[:POSTED]-(other:Author)
      WHERE other.isInWorkspace = false
      WITH other, COUNT(reply) AS replyCount
      ORDER BY replyCount DESC
      LIMIT 10
      RETURN
          other.userName AS id,
          'AUTHOR' AS nodeType
      """)
  List<AuthorNodeDto> findAuthorsMostRepliedToByAuthor(@Param("authorId") String authorId);

  @Query(
      """
      MATCH (a:Author {userName: $authorId})-[:POSTED]->(parent:Tweet)<-[:HAS_PARENT]-(reply:Tweet)<-[:POSTED]-(other:Author)
      WHERE other.isInWorkspace = false
      WITH other, COUNT(reply) AS replyCount
      ORDER BY replyCount DESC
      LIMIT 10
      RETURN
          other.userName AS id,
          'AUTHOR' AS nodeType
      """)
  List<AuthorNodeDto> findAuthorsMostReplyingToAuthor(@Param("authorId") String authorId);

  @Query(
      """
          MATCH (a:Author {userName: $authorId})-[:POSTED]->(reply:Tweet)-[:HAS_PARENT]->(parent:Tweet)
          WHERE parent.isInWorkspace = false
          ORDER BY parent.publicationDate DESC
          RETURN
              parent.id AS id,
              'TWEET' AS nodeType
          LIMIT 10
          """)
  List<TweetNodeDto> findTweetsRepliedToByAuthor(@Param("authorId") String authorId);

  @Query(
      """
          MATCH (t:Tweet)-[:MENTION]->(a:Author {userName: $authorId})
          WHERE t.isInWorkspace = false
          ORDER BY t.publicationDate DESC
          RETURN
              t.id AS id,
              'TWEET' AS nodeType
          LIMIT 10
          """)
  List<TweetNodeDto> findTweetsMentioningAuthor(@Param("authorId") String authorId);

  @Query(
      """
           MATCH (a:Author)-[:POSTED]->(t:Tweet {id: $tweetId})
           RETURN
               a.userName AS id,
               'AUTHOR' AS nodeType
           """)
  Optional<AuthorNodeDto> findAuthorByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
           MATCH (t:Tweet {id: $tweetId})-[:HAS_HASHTAG]->(h:Hashtag)
           WHERE h.isInWorkspace = false
           RETURN
               h.hashtag AS id,
               'HASHTAG' AS nodeType
           """)
  List<HashtagNodeDto> findHashtagsByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
              MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
              WHERE t.id IN $tweetIds
                AND (h.isInWorkspace IS NULL OR h.isInWorkspace = false)
              WITH h, COLLECT(DISTINCT t.id) AS tweetUsing
              WHERE SIZE(tweetUsing) > 1
              RETURN
                  h.hashtag AS id,
                  'HASHTAG' AS nodeType,
                  SIZE(tweetUsing) AS tweetCount
              ORDER BY tweetCount DESC
              LIMIT 10
              """)
  List<HashtagNodeDto> findCommonHashtagsByTweetIds(@Param("tweetIds") List<String> tweetIds);

  @Query(
      """
           MATCH (t:Tweet {id: $tweetId})-[:MENTION]->(a:Author)
           WHERE a.isInWorkspace = false
           RETURN
               a.userName AS id,
               'AUTHOR' AS nodeType
           """)
  List<AuthorNodeDto> findMentionedAuthorsByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (t:Tweet {id: $tweetId})-[:HAS_PARENT]->(parent:Tweet)
          RETURN
              parent.id AS id,
              'TWEET' AS nodeType
          LIMIT 1
          """)
  Optional<TweetNodeDto> findParentByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (child:Tweet)-[:HAS_PARENT]->(t:Tweet {id: $tweetId})
          WHERE child.isInWorkspace = false
          RETURN
              child.id AS id,
              'TWEET' AS nodeType,
          """)
  List<TweetNodeDto> findChildrenByTweetId(@Param("tweetId") String tweetId);

  @Query(
      """
          MATCH (a:Author)-[:USES_HASHTAG]->(h:Hashtag {hashtag: $hashtagName})
          WHERE a.isInWorkspace = false
          WITH a, COUNT(*) AS usesCount
          ORDER BY usesCount DESC
          LIMIT 5
          RETURN
              a.userName AS id,
              'AUTHOR' AS nodeType
          """)
  List<AuthorNodeDto> findTopAuthorsByHashtagName(@Param("hashtagName") String hashtagName);

  @Query(
      """
          MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag {hashtag: $hashtagName})
          WHERE t.isInWorkspace = false
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
  List<TweetNodeDto> findTopTweetsByHashtagName(@Param("hashtagName") String hashtagName);

  @Query(
      """
        MATCH (h:Hashtag {hashtag: $hashtagName})<-[:HAS_HASHTAG]-(t:Tweet)-[:HAS_HASHTAG]->(other:Hashtag)
        WHERE other.hashtag <> $hashtagName && other.isInWorkspace = false
        WITH other, COUNT(t) AS occurrenceCount
        ORDER BY occurrenceCount DESC
        LIMIT 10
        RETURN
            other.hashtag AS id,
            'HASHTAG' AS nodeType
        """)
  List<HashtagNodeDto> findRelatedHashtags(@Param("hashtagName") String hashtagId);
}
