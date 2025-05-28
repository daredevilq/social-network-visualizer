package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.enums.RelationType;
import com.example.social_network_visualizer_backend.model.Author;
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
                MERGE (a:Author { userName: author.userName })
                SET
                    a.id = CASE WHEN a.id IS NULL AND author.id IS NOT NULL THEN author.id ELSE a.id END,
                    a.displayName = CASE WHEN a.displayName IS NULL AND author.displayName IS NOT NULL THEN author.displayName ELSE a.displayName END,
                    a.name = CASE WHEN a.name IS NULL AND author.name IS NOT NULL THEN author.name ELSE a.name END,
                    a.foreignId = CASE WHEN a.foreignId IS NULL AND author.foreignId IS NOT NULL THEN author.foreignId ELSE a.foreignId END,
                    a.bot = CASE WHEN a.bot IS NULL AND author.bot IS NOT NULL THEN author.bot ELSE a.bot END
                  
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
                ORDER BY t.publicationDate DESC
                RETURN t.url AS url, t.contentPreview AS contentPreview
                LIMIT 3
            """)
    List<TweetPreviewDto> findLast3TweetUrlsByAuthorUsername(@Param("authorName") String authorName);

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
    Optional<Author> findAuthorByUserName(@Param("userName") String userName);

    @Query("""
            MATCH (a:Author)-[r:USES_HASHTAG]->(h:Hashtag)
                    WHERE a.userName=$authorName
                    RETURN h.hashtag as name, count(*) AS frequency
                    ORDER BY frequency DESC
                    LIMIT 10
            """)
    List<HashtagFrequency> findTopHashtagsByAuthor(@Param("authorName") String authorName);

    @Query("""
            MATCH (a:Author)-[:MENTIONS]->(u:Author)
            WHERE a.userName=$authorName
            RETURN u.userName
            """)
    List<String> findMentionsUsersByAuthor(@Param("authorName") String authorName);

    @Query("""
                MATCH (a:Author)-[:POSTED]->(t:Tweet)
                WHERE a.userName=$authorName AND size(t.content) > 1
                RETURN t.content
            """)
    List<String> findTweetsContentByUser(@Param("authorName") String authorName);

    @Query("""
                MATCH (a:Author)-[r:RETWEETS]->(u:Author)
                WHERE a.userName=$authorName
                RETURN u.userName
            """)
    List<String> findAuthorRetweets(@Param("authorName") String authorName);

    @Query("""
                MATCH (u:Author)-[r:RETWEETS]->(a:Author)
                WHERE a.userName=$authorName
                RETURN u.userName
            """)
    List<String> findRetweetsByUser(@Param("authorName") String authorName);

    @Query("""
            MATCH (a:Author)-[:POSTED]->(t:Tweet)
            WHERE a.userName=$authorName
            WITH a, t,
                 t.likesCount AS likes,
                 t.retweetsCount AS retweets,
                 t.repliesCount AS replies,
                 (t.likesCount + t.retweetsCount + t.repliesCount) AS engagementScore
            RETURN
                a.userName as userName,
                t.contentPreview AS preview,
                t.url AS tweetUrl,
                likes,
                retweets,
                replies,
                engagementScore
            ORDER BY engagementScore DESC
            LIMIT 5
            """)
    List<ViralTweetDto> findTheMostViralTweet(@Param("authorName") String authorName);

    @Query("""
        UNWIND range(0,23) AS h
        UNWIND range(1,7) AS d
        OPTIONAL MATCH (a:Author {userName:$username})-[:POSTED]->(t:Tweet)
           WHERE t.publicationDate.hour = h
           AND t.publicationDate.dayOfWeek = d
        WITH  h, d, count(t)   AS posts
        RETURN h AS hour, d AS dayOfWeek, posts
        ORDER  BY d, h;
    """)
    List<ActivityHeatmap> getUserActivityHeatMap(@Param("username") String username);
}

