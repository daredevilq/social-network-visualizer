package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.author.ViralTweetDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetDetailsDto;
import com.example.social_network_visualizer_backend.dto.tweet.TweetWithStats;
import com.example.social_network_visualizer_backend.enums.TweetSortOption;
import com.example.social_network_visualizer_backend.model.Tweet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface TweetRepository extends Neo4jRepository<Tweet, String> {

  @Query(
      """
                UNWIND $tweets AS tweet
                CREATE (t:Tweet {
                    id: tweet.id,
                    objectCreatedAt: tweet.objectCreatedAt,
                    publicationDate: tweet.publicationDate,
                    objectType: tweet.objectType,
                    language: tweet.language,
                    contentPreview: tweet.contentPreview,
                    content: tweet.content,
                    twitterId: tweet.twitterId,
                    url: tweet.url,
                    conversationId: tweet.conversationId,
                    links: tweet.links,
                    photos: tweet.photos,
                    videos: tweet.videos,
                    repliesCount: tweet.repliesCount,
                    retweetsCount: tweet.retweetsCount,
                    likesCount: tweet.likesCount,
                    isInWorkspace: tweet.isInWorkspace
                })
            """)
  void createAll(@Param("tweets") List<Map<String, Object>> tweets);

  @Query(
      """
                UNWIND $tweets AS tweet
                MERGE (t:Tweet { id: tweet.id })
                SET t.objectCreatedAt = tweet.objectCreatedAt,
                    t.publicationDate = tweet.publicationDate,
                    t.objectType = tweet.objectType,
                    t.language = tweet.language,
                    t.contentPreview = tweet.contentPreview,
                    t.content = tweet.content,
                    t.twitterId = tweet.twitterId,
                    t.url = tweet.url,
                    t.conversationId = tweet.conversationId,
                    t.links = tweet.links,
                    t.photos = tweet.photos,
                    t.videos = tweet.videos,
                    t.repliesCount = tweet.repliesCount,
                    t.retweetsCount = tweet.retweetsCount,
                    t.likesCount = tweet.likesCount
            """)
  void mergeAll(@Param("tweets") List<Map<String, Object>> tweets);

  @Query(
      """
                UNWIND $tweetMentionsData AS data
                MATCH (a:Author {userName: data.userName})
                WITH a, data
                MATCH (t:Tweet {id: data.tweetId})
                MERGE (t)-[r:MENTION]->(a)
                ON CREATE SET r.weight = 1
                ON MATCH SET r.weight = COALESCE(r.weight, 0) + 1
            """)
  void createTweetMentionsRelations(List<Map<String, Object>> tweetMentionsData);

  @Query(
      """
                UNWIND $tweetRepliesData AS data
                MATCH (a:Author {userName: data.userName})
                WITH a, data
                MATCH (t:Tweet {id: data.tweetId})
                MERGE (t)-[r:HAS_REPLY]->(a)
                ON CREATE SET r.weight = 1
                ON MATCH SET r.weight = COALESCE(r.weight, 0) + 1
            """)
  void createTweetRepliesRelations(List<Map<String, Object>> tweetRepliesData);

  @Query(
      """
                UNWIND $tweetParentData AS data
                MATCH (t:Tweet {id: data.tweetId})
                WITH t, data
                MATCH (p:Tweet {id: data.parentId})
                MERGE (t)-[r:HAS_PARENT {weight: 1}]->(p)
            """)
  void createTweetParentRelations(List<Map<String, Object>> tweetParentData);

  @Query(
      """
                UNWIND $tweetHashtagsData AS data
                MATCH (t:Tweet {id: data.tweetId})
                WITH t, data
                MATCH (h:Hashtag {hashtag: data.hashtag})
                MERGE (t)-[r:HAS_HASHTAG {weight: 1}]->(h)
            """)
  void createTweetHashtagRelations(List<Map<String, Object>> tweetHashtagsData);

  @Query("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Tweet) REQUIRE t.id IS UNIQUE")
  void createTweetIdConstraint();

  @Query(
      """
                MATCH (a:Author)-[:POSTED]->(tAll:Tweet)
                WHERE $authorName IS NULL OR a.userName = $authorName
                WITH avg(coalesce(tAll.likesCount, 0)) AS avgLikes,
                     avg(coalesce(tAll.retweetsCount, 0)) AS avgRetweets,
                     avg(coalesce(tAll.repliesCount, 0)) AS avgReplies

                MATCH (a:Author)-[:POSTED]->(t:Tweet)
                WHERE ($authorName IS NULL OR a.userName = $authorName) AND ($search IS NULL OR $search = "" OR toLower(t.content) CONTAINS toLower($search))
                OPTIONAL MATCH (t)-[:HAS_HASHTAG]->(h:Hashtag)

                WITH t, collect(DISTINCT h.hashtag) AS hashtags, avgLikes, avgRetweets, avgReplies, a,
                         CASE $sortField
                             WHEN 'DATE' THEN t.publicationDate
                             WHEN 'LIKES' THEN t.likesCount
                             WHEN 'RETWEETS' THEN t.retweetsCount
                             WHEN 'REPLIES' THEN t.repliesCount
                             ELSE t.publicationDate
                         END AS sortField

                WHERE size($hashtags) = 0 OR any(tag IN $hashtags WHERE tag IN hashtags)

                WITH t, hashtags, avgLikes, avgRetweets, avgReplies, a,
                         (t.likesCount + t.retweetsCount + t.repliesCount) AS totalEngagement,
                         (t.likesCount + t.retweetsCount + t.repliesCount) / (avgLikes + avgRetweets + avgReplies) * 100 AS engagement,
                         sortField

                WITH t, hashtags, totalEngagement, engagement, sortField, a,
                     CASE WHEN engagement > 150 THEN true ELSE false END AS isHighEngagement

                WHERE $highEngagement = false OR isHighEngagement = true

                RETURN
                    t.id AS id,
                    a.userName AS authorName,
                    t.publicationDate AS publicationDate,
                    t.objectType AS objectType,
                    t.language AS language,
                    t.contentPreview AS contentPreview,
                    t.content AS content,
                    t.twitterId AS twitterId,
                    t.url AS url,
                    t.conversationId AS conversationId,
                    t.photos AS photos,
                    t.videos AS videos,
                    t.repliesCount AS repliesCount,
                    t.retweetsCount AS retweetsCount,
                    t.likesCount AS likesCount,
                    hashtags,
                    engagement,
                    isHighEngagement

                ORDER BY
                    CASE WHEN $sortDirection = 'ASC' THEN sortField END ASC,
                    CASE WHEN $sortDirection = 'DESC' THEN sortField END DESC
            """)
  List<TweetWithStats> findTweetsWithRelationships(
      @Param("authorName") String authorName,
      @Param("search") String search,
      @Param("sortField") TweetSortOption sortField,
      @Param("sortDirection") String sortDirection,
      @Param("hashtags") List<String> hashtags,
      @Param("highEngagement") Boolean highEngagement);

  @Query(
      """
                MATCH (t:Tweet)
                WHERE $inWorkspace = false OR t.isInWorkspace = true
                OPTIONAL MATCH (t)-[r]-()
                WITH t, count(r) AS relationshipCount
                ORDER BY relationshipCount DESC
                LIMIT $limit
                OPTIONAL MATCH (a:Author)-[:POSTED]->(t)
                RETURN
                    t.id AS id,
                    t.contentPreview AS name,
                    'TWEET' AS nodeType,
                    t.objectCreatedAt AS objectCreatedAt,
                    t.publicationDate AS publicationDate,
                    t.objectType AS objectType,
                    t.language AS language,
                    t.contentPreview AS contentPreview,
                    t.content AS content,
                    t.twitterId AS twitterId,
                    t.url AS url,
                    t.conversationId AS conversationId,
                    t.links AS links,
                    t.photos AS photos,
                    t.videos AS videos,
                    t.repliesCount AS repliesCount,
                    t.retweetsCount AS retweetsCount,
                    t.likesCount AS likesCount,
                    a.userName AS authorName
            """)
  List<TweetNodeDto> findTweets(
      @Param("inWorkspace") boolean inWorkspace, @Param("limit") int limit);

  @Query(
      """
        MATCH (a:Author)-[:POSTED]->(t:Tweet)
        WITH a, t,
             t.likesCount AS likes,
             t.retweetsCount AS retweets,
             t.repliesCount AS replies,
             (t.likesCount + t.retweetsCount + t.repliesCount) AS engagementScore
        RETURN
            a.userName as userName,
            t.id AS tweetId,
            t.contentPreview AS preview,
            t.url AS tweetUrl,
            likes,
            retweets,
            replies,
            engagementScore
        ORDER BY engagementScore DESC
        LIMIT 10
    """)
  List<ViralTweetDto> findTheMostViralTweets();

  @Query(
      """
          MATCH (t:Tweet {id: $tweetId})
          OPTIONAL MATCH (a:Author)-[:POSTED]->(t)
          OPTIONAL MATCH (t)-[:HAS_HASHTAG]->(h:Hashtag)
          OPTIONAL MATCH (t)-[:MENTION]->(m:Author)
          OPTIONAL MATCH (t)-[:REPLY_TO]->(parent:Tweet)

          MATCH (allT:Tweet)
          WITH
              t, a, h, m, parent,
              avg(coalesce(allT.likesCount, 0)) AS avgLikes,
              avg(coalesce(allT.retweetsCount, 0)) AS avgRetweets,
              avg(coalesce(allT.repliesCount, 0)) AS avgReplies

          WITH
              t,
              a,
              collect(DISTINCT h.hashtag) AS hashtags,
              collect(DISTINCT m.userName) AS mentions,
              parent,
              (coalesce(t.likesCount,0) + coalesce(t.retweetsCount,0) + coalesce(t.repliesCount,0)) AS totalEngagement,
              ((coalesce(t.likesCount,0) + coalesce(t.retweetsCount,0) + coalesce(t.repliesCount,0))
                  / (avgLikes + avgRetweets + avgReplies)) * 100 AS engagement

          RETURN
              t.id AS id,
              t.url AS url,
              a.userName AS authorName,
              t.content AS content,
              t.photos AS photos,
              t.videos AS videos,
              t.likesCount AS likesCount,
              t.retweetsCount AS retweetsCount,
              t.repliesCount AS repliesCount,
              engagement,
            false AS isHighEngagement,
            t.language AS language,
              t.objectType AS objectType,
              hashtags,
              mentions,
              parent.id AS replyToId,
              parent.content AS replyToContent
    """)
  Optional<TweetDetailsDto> findTweetDetailsById(@Param("tweetId") String tweetId);

  @Query(
      """
      MATCH (t:Tweet)
      WHERE t.id IN $ids
      OPTIONAL MATCH (a:Author)-[:POSTED]->(t)
      RETURN
          t.id AS id,
          t.contentPreview AS name,
          'TWEET' AS nodeType,
          t.content AS content,
          a.userName AS authorName,
          t.likesCount AS likesCount,
          t.retweetsCount AS retweetsCount,
          t.repliesCount as repliesCount,
          t.language as language,
          t.objectCreatedAt as objectCreatedAt,
          t.publicationDate as publicationDate,
          t.url as url
      """)
  List<TweetNodeDto> findFullTweetNodesByIds(@Param("ids") Set<String> ids);
}
