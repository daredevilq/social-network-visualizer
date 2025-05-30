package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Hashtag;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface HashtagRepository extends Neo4jRepository<Hashtag, String> {
    @Query("""
                UNWIND $hashtags AS hashtag
                CREATE (h:Hashtag {
                    hashtag: hashtag.hashtag
                })
            """)
    void createAll(@Param("hashtags") List<Map<String, Object>> hashtags);

    @Query("""
                UNWIND $hashtags AS hashtag
                MERGE (h:Hashtag { hashtag: hashtag.hashtag })
            """)
    void mergeAll(@Param("hashtags") List<Map<String, Object>> hashtags);

    @Query("CREATE CONSTRAINT IF NOT EXISTS FOR (h:Hashtag) REQUIRE h.hashtag IS UNIQUE")
    void createHashtagConstraint();
}
