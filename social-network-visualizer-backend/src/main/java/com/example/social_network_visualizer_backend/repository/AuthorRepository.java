package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;
import com.example.social_network_visualizer_backend.dto.AuthorLinkDto;
import com.example.social_network_visualizer_backend.dto.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.AuthorStatsDto;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;


public interface AuthorRepository extends Neo4jRepository<Author, String> {

    @Query("""
                UNWIND $authors AS author
                CREATE (a:Author {
                    id: author.id,
                    userName: author.userName,
                    displayName: author.displayName,
                    name: author.name,
                    foreignId: author.foreignId,
                    bot: author.bot
                })
            """)
    void createAll(@Param("authors") List<Map<String, Object>> authors);

    @Query("""
                UNWIND $authors AS author
                MERGE (a:Author {
                    id: author.id,
                    userName: author.userName,
                    displayName: author.displayName,
                    name: author.name,
                    foreignId: author.foreignId,
                    bot: author.bot
                })
            """)
    void mergeAll(@Param("authors") List<Map<String, Object>> authors);

    @Query("""
                UNWIND $authorTweetData AS data
                MATCH (a:Author {userName: data.userName})
                WITH a, data
                MATCH (t:Tweet {id: data.tweetId})
                MERGE (a)-[:POSTED]->(t)
            """)
    void createAuthorTweetRelations(@Param("authorTweetData") List<Map<String, Object>> authorTweetData);

    @Query("CREATE CONSTRAINT IF NOT EXISTS FOR (a:Author) REQUIRE a.userName IS UNIQUE")
    void createAuthorUserNameConstraint();

    @Query("""
                MATCH (a:Author)-[:POSTED]->(t:Tweet)
                WHERE a.userName = $authorName
                OPTIONAL MATCH (t)-[:HAS_HASHTAG]->(h:Hashtag)
                OPTIONAL MATCH (t)-[:HAS_CASHTAG]->(c:Cashtag)
                RETURN t.id AS id,
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
                       COLLECT(h) AS hashtags,
                       COLLECT(c) AS cashtags
                ORDER BY t.publicationDate DESC
                LIMIT 10
            """)
    List<Tweet> findLast10TweetsByAuthorUsername(@Param("authorName") String authorName);

    @Query("""
            MATCH (a:Author)-[:POSTED]->(t:Tweet)
            WHERE a.userName = $authorName
            RETURN MIN(t.publicationDate) AS dateOfFirstTweet,
                   COUNT(CASE WHEN t.objectType = 'TWEET' THEN 1 END) AS tweetsCount,
                   COUNT(CASE WHEN t.objectType = 'RETWEET' THEN 1 END) AS retweetsCount,
                   COUNT(CASE WHEN t.objectType = 'REPLY' THEN 1 END) AS repliesCount,
                   COALESCE(AVG(t.repliesCount), 0) AS averageRepliesCount,
                   COALESCE(AVG(t.retweetsCount), 0) AS averageRetweetsCount,
                   COALESCE(AVG(t.likesCount), 0) AS averageLikesCount
                                                         
            """)
    Optional<AuthorStatsDto> findStatsByAuthorId(@Param("authorName") String authorName);

    @Query("""
                MATCH (a:Author {userName: $authorName})-[:POSTED]->(t:Tweet)
                WITH a, t
                RETURN datetime(t.publicationDate) AS activityDate
                ORDER BY activityDate DESC
            """)
    List<ZonedDateTime> getUserActivity(@Param("authorName") String authorName);

    @Query("""
                MATCH (a1:Author)-[r:RETWEETS]->(a2:Author)
                RETURN a1.userName AS source, a2.userName AS target
            """)
    List<AuthorLinkDto> findUserRetweets();

    @Query("""
                   MATCH (a1:Author {userName: $sourceName}), (a2:Author {userName: $targetName})
                   CALL gds.shortestPath.dijkstra.stream('g_author_mentions', {
                       sourceNode: a1,
                       targetNode: a2
                       })
                   YIELD index, path
                   WITH nodes(path) AS nodes
                   UNWIND nodes AS node
                   MATCH (author:Author) WHERE id(author) = id(node)
            RETURN author.userName AS userNames
            """)
    List<String> findShortestPathAuthors(@Param("sourceName") String sourceName, @Param("targetName") String targetName);

    @Query("""
                MATCH (a1:Author)-[r]->(a2:Author)
                WHERE type(r) IN $relations
                RETURN a1.userName AS source, a2.userName AS target, type(r) AS relation
            """)
    List<AuthorLinkDto> findAuthorRelations(@Param("relations") Set<RelationType> relations);

    @Query("""
                MATCH (a:Author)
                ORDER BY a.pagerank DESC
                RETURN
                    a.userName AS name,
                    a.pagerank AS pagerank,
                    a.degreeCentrality AS centrality,
                    a.community AS community
            """)
    List<AuthorNodeDto> findAuthors();

    @Query("""
                MATCH (a:Author)
                WHERE a.community = $communityId
                ORDER BY a.pagerank DESC
                RETURN
                    a.userName AS name,
                    a.pagerank AS pagerank,
                    a.degreeCentrality AS centrality,
                    a.community AS community
            """)
    List<AuthorNodeDto> findAuthorsWithCommunity(@Param("communityId") int communityId);

    @Query("""
                MATCH (a1:Author)-[r]->(a2:Author)
                WHERE type(r) IN $relations
                  AND a1.community = $communityId
                  AND a2.community = $communityId
                RETURN a1.userName AS source, a2.userName AS target, type(r) AS relation
            """)
    List<AuthorLinkDto> findAuthorRelationsWithinCommunity(
            @Param("relations") Set<RelationType> relations,
            @Param("communityId") int communityId);

    @Query("""
                MATCH (a:Author)
                WHERE a.userName = $userName
                RETURN a
            """)
    Optional<Author> findAuthorByUserName(String userName);

    @Query("""
        MATCH (a:Author)-[:USES_HASHTAG]->(h:Hashtag)
        WHERE a.community = $communityId
        WITH h.hashtag AS tag, count(*) AS cnt
        ORDER BY cnt DESC
        LIMIT 3
        RETURN tag AS value
    """)
    List<String> findTopHashtagsByCommunity(@Param("communityId") int communityId);

    @Query("""
        MATCH (a:Author)-[:POSTED]->(t:Tweet)
        WHERE a.community = $communityId
        WITH date(t.publicationDate) AS day, count(t) AS posts
        ORDER BY day
        RETURN day AS day, posts AS posts
    """)
    List<ActivityPoint> getCommunityDailyActivity(@Param("communityId") int communityId);
}

