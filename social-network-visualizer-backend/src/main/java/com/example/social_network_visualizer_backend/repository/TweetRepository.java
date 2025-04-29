package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface TweetRepository extends Neo4jRepository<Tweet, String> {


    @Query("""
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
            likesCount: tweet.likesCount
        })
    """)
    void createAll(@Param("tweets") List<Map<String, Object>> tweets);


    @Query("""
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


    @Query("""
        UNWIND $tweetMentionsData AS data
        MATCH (a:Author {userName: data.userName})
        WITH a, data
        MATCH (t:Tweet {id: data.tweetId})
        MERGE (t)-[:MENTION]->(a)
    """)
    void createTweetMentionsRelations(List<Map<String, Object>> tweetMentionsData);
    @Query("""
        UNWIND $tweetRepliesData AS data
        MATCH (a:Author {userName: data.userName})
        WITH a, data
        MATCH (t:Tweet {id: data.tweetId})
        MERGE (t)-[:HAS_REPLY]->(a)
    """)
    void createTweetRepliesRelations(List<Map<String, Object>> tweetRepliesData);

    @Query("""
        UNWIND $tweetParentData AS data
        MATCH (t:Tweet {id: data.tweetId})
        WITH t, data
        MATCH (p:Tweet {id: data.parentId})
        MERGE (t)-[:HAS_PARENT]->(p)
    """)
    void createTweetParentRelations(List<Map<String, Object>> tweetParentData);

    @Query("""
        UNWIND $tweetHashtagsData AS data
        MATCH (t:Tweet {id: data.tweetId})
        WITH t, data
        MATCH (h:Hashtag {hashtag: data.hashtag})
        MERGE (t)-[:HAS_HASHTAG]->(h)
    """)
    void createTweetHashtagRelations(List<Map<String, Object>> tweetHashtagsData);

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
    List<Tweet> findTweetsWithRelationships(@Param("authorName") String authorName);
}
