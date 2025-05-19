package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.ActivityPoint;
import com.example.social_network_visualizer_backend.dto.HashtagFrequency;
import com.example.social_network_visualizer_backend.dto.ProjectStatsDto;
import com.example.social_network_visualizer_backend.dto.ViralTweetDto;
import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

import java.util.List;

public interface ProjectRepository extends Neo4jRepository<Author, String> {
    @Query("""
        OPTIONAL MATCH (a:Author)
        OPTIONAL MATCH (a)-[:POSTED]->(t:Tweet)
        OPTIONAL MATCH (t)-[:HAS_HASHTAG]->(h:Hashtag)
        RETURN
            coalesce(count(DISTINCT t), 0) AS tweetsCount,
            coalesce(count(DISTINCT a), 0) AS usersCount,
            coalesce(count(DISTINCT h), 0) AS hashtagsCount
    """)
    ProjectStatsDto getProjectStats();

    @Query("""
        MATCH (t:Tweet)
        WITH date(t.publicationDate) AS day, count(t) AS posts
        ORDER BY day
        RETURN day, posts
    """)
    List<ActivityPoint> getProjectActivity();

    @Query("""
        MATCH (t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
        RETURN h.hashtag AS name, count(*) AS frequency
        ORDER BY frequency DESC
        LIMIT 10
    """)
    List<HashtagFrequency> findTopHashtags();

    @Query("""
        MATCH (a:Author)-[:POSTED]->(t:Tweet)
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
        LIMIT 10
    """)
    List<ViralTweetDto> findTheMostViralTweets();
}
