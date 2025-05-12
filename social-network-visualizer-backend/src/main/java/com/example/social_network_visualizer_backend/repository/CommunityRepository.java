package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.CommunitySummary;
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
        RETURN COLLECT(tag)[0..3] AS topHashtags
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
            RETURN collect(h.hashtag)[0..3] AS topHashtags
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
        WHERE a.community IS NOT NULL
        WITH a.community AS communityId, COUNT(*) AS memberCount
        ORDER BY memberCount DESC
        LIMIT $limit
        RETURN communityId
    """)
    List<Integer> findTopCommunityIds(@Param("limit") int limit);

}
