package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.community.CommunityOverview;
import com.example.social_network_visualizer_backend.dto.community.CommunitySummary;
import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;


public interface CommunityRepository  extends Neo4jRepository<Author, String> {
    @Query("""
    MATCH (a:Author)
    WHERE a.community IS NOT NULL
    WITH a.community AS communityId, COUNT(a) AS memberCount
    
    CALL (communityId) {
        MATCH (au:Author {community: communityId})
        RETURN au.userName AS topAuthor,
            au.pagerank AS topPageRank
        ORDER BY au.pagerank DESC
        LIMIT 1
    }
    
    CALL (communityId) {
        MATCH (a:Author {community: communityId})-[:USES_HASHTAG]->(h:Hashtag)
        WITH h.hashtag AS tag, COUNT(*) AS tagCnt
        ORDER BY tagCnt DESC
        RETURN COLLECT(tag)[0..50] AS topHashtags
    }
    
    CALL (communityId) {
        MATCH (a:Author {community: communityId})-[:POSTED]->(t:Tweet)
        WITH date(t.publicationDate) AS day, COUNT(t) AS posts
        ORDER BY day
        RETURN COLLECT({day: day, posts: posts}) AS communityActivity
    }
    
    RETURN communityId,
           memberCount,
           topAuthor,
           topPageRank,
           topHashtags,
           communityActivity
    ORDER BY memberCount DESC;
    """)
    List<CommunitySummary> findAllCommunitySummaries();


    @Query("""
        MATCH (a:Author)
        WHERE a.community IS NOT NULL
        WITH a.community AS communityId, count(a) AS memberCount
        ORDER BY memberCount DESC
        SKIP $page * $size
        LIMIT $size
        
        CALL (communityId) {
            MATCH (au:Author {community: communityId})
            RETURN au.userName AS topAuthor,
            au.pagerank AS topPageRank
            ORDER BY au.pagerank DESC
            LIMIT 1
        }
        
        CALL (communityId){
            MATCH (a:Author {community: communityId})-[:USES_HASHTAG]->(h:Hashtag)
            RETURN collect(h.hashtag)[0..50] AS topHashtags
        }
        
        CALL (communityId) {
            MATCH (a:Author {community: communityId})-[:POSTED]->(t:Tweet)
            WITH date(t.publicationDate) AS day, count(t) AS posts
            ORDER BY day
            RETURN collect({day: day, posts: posts}) AS communityActivity
        }
        
        RETURN communityId,
            memberCount,
            topAuthor,
            topPageRank,
            topHashtags,
            communityActivity;
    """)
    List<CommunitySummary> findPagedCommunitySummaries(@Param("page") int page, @Param("size") int size);

    @Query("""
      MATCH (a:Author)
      WHERE a.community = $communityId
      WITH $communityId AS communityId, count(a) AS memberCount
    
      CALL {
        WITH communityId
        MATCH (au:Author {community: communityId})
        RETURN au.userName AS topAuthor,
               au.pagerank AS topPageRank
        ORDER BY topPageRank DESC
        LIMIT 1
      }
    
      CALL {
        WITH communityId
        MATCH (a:Author {community: communityId})-[:USES_HASHTAG]->(h:Hashtag)
        RETURN collect(h.hashtag)[0..50] AS topHashtags
      }
    
      CALL {
        WITH communityId
        MATCH (a:Author {community: communityId})-[:POSTED]->(t:Tweet)
        WITH date(t.publicationDate) AS day, count(t) AS posts
        ORDER BY day
        RETURN collect({ day: day, posts: posts }) AS communityActivity
      }
   
      RETURN
        communityId,
        memberCount,
        topAuthor,
        topPageRank,
        topHashtags,
        communityActivity
    """)
    CommunitySummary findCommunitySummaryById(@Param("communityId") int communityId);

    @Query("""
        MATCH (a:Author)
        WHERE a.community IS NOT NULL
        WITH a.community AS communityId, COUNT(*) AS memberCount
        ORDER BY memberCount DESC
        LIMIT $limit
        RETURN communityId
    """)
    List<Integer> findTopCommunityIds(@Param("limit") int limit);


    @Query("""
    MATCH (a:Author)
    WHERE a.community IS NOT NULL
    WITH a.community AS cid, COUNT(a) AS members

    WITH collect(members) AS sizes,
         size(collect(cid)) AS totalCommunities

    CALL {
      WITH sizes
      UNWIND apoc.coll.frequencies(sizes) AS m
      RETURN collect(
        { communitySize: toInteger(m.item), memberCount: m.count }
      ) AS sizeHistogram
    }

    UNWIND sizes AS s
    WITH totalCommunities, sizes, sizeHistogram,
         min(s) AS minSize,
         max(s) AS maxSize,
         avg(s) AS avgSize,
         apoc.agg.percentiles(s,[0.10,0.25,0.5,0.75,0.90])[0] AS p10,
         apoc.agg.percentiles(s,[0.10,0.25,0.5,0.75,0.90])[1] AS p25,
         apoc.agg.percentiles(s,[0.10,0.25,0.5,0.75,0.90])[2] AS p50,
         apoc.agg.percentiles(s,[0.10,0.25,0.5,0.75,0.90])[3] AS p75,
         apoc.agg.percentiles(s,[0.10,0.25,0.5,0.75,0.90])[4] AS p90

    CALL {
      MATCH (au:Author)
      WHERE au.community IS NOT NULL
      OPTIONAL MATCH (au)-[:POSTED]->(tw:Tweet)
      WITH au, COUNT(tw) AS tweetsPerAuthor
      RETURN
        AVG(tweetsPerAuthor) AS avgTweetsPerAuthor,
        SUM(tweetsPerAuthor) AS totalTweets
    }

    WITH *,
         sizeHistogram

    CALL {
      MATCH (au:Author)
      WHERE au.community IS NOT NULL
      OPTIONAL MATCH (au)-[:USES_HASHTAG]->(h:Hashtag)

      WITH au,
           COUNT(h) AS tagsPerAuthor,
           COLLECT(DISTINCT h) AS tagListPerAuthor

      WITH
           AVG(tagsPerAuthor) AS avgHashtagsPerAuthor,
           apoc.coll.toSet(apoc.coll.flatten(COLLECT(tagListPerAuthor))) AS allTags
      RETURN
           avgHashtagsPerAuthor,
           size(allTags) AS uniqueHashtags
    }

    RETURN
      avgHashtagsPerAuthor  AS avgHashtagsPerAuthor,
      totalTweets           AS totalTweets,
      totalCommunities      AS totalCommunities,
      minSize               AS minSize,
      maxSize               AS maxSize,
      avgSize               AS avgSize,
      p10                   AS p10,
      p25                   AS p25,
      p50                   AS median,
      p75                   AS p75,
      p90                   AS p90,
      sizeHistogram         AS sizeHistogram,
      avgTweetsPerAuthor    AS avgTweetsPerAuthor,
      uniqueHashtags        AS uniqueHashtags;
            """)
    CommunityOverview getCommunityOverview();

    @Query("""
      MATCH (a:Author)
      WHERE a.community = $communityId
      RETURN a
    """)
    List<Author> findAuthorsByCommunityId(@Param("communityId") int communityId);

    @Query("""
        UNWIND range(0,23) AS h
        UNWIND range(1,7) AS d
        OPTIONAL MATCH (a:Author {community:$communityId})-[:POSTED]->(t:Tweet)
           WHERE t.publicationDate.hour = h
           AND t.publicationDate.dayOfWeek = d
        WITH  h, d, count(t)   AS posts
        RETURN h AS hour, d AS dayOfWeek, posts
        ORDER  BY d, h;
    """)
    List<ActivityHeatmap> getCommunityActivityHeatMap(@Param("communityId") int communityId);

}
