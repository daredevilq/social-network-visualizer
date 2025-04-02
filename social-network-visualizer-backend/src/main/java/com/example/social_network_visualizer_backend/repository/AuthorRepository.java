package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.AuthorLinkDTO;
import com.example.social_network_visualizer_backend.dto.AuthorNodeDTO;
import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuthorRepository extends Neo4jRepository<Author, String> {

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
    List<Tweet> findTop10TweetsByAuthorUsername(@Param("authorName") String authorName);

    @Query("""
        MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:MENTIONS]->(a2:Author)
        MERGE (a1)-[:MENTIONS]->(a2)
        """)
    void createRelationshipAuthorMentionsAuthor();

    @Query("""
    CALL gds.graph.project(
      'author-mentions',
      'Author',
      {
        MENTIONS: {
          type: 'MENTIONS',
          orientation: 'NATURAL'
        }
      }
    ) YIELD graphName
    RETURN 1
    """)
    void createGdsGraph();

    @Query("""
        CALL gds.pageRank.write('author-mentions', {
            writeProperty: 'pagerank'
        }) YIELD nodePropertiesWritten
        RETURN 1
    """)
    void computePageRank();

    @Query("""
        CALL gds.labelPropagation.write('author-mentions', {
            writeProperty: 'community'
        }) YIELD communityCount
        RETURN 1
        """)
    void createCommunities();

    @Query("""
            MATCH (a:Author)
            WHERE a.pagerank IS NOT NULL
            RETURN a.userName AS id, a.pagerank AS pagerank, a.community AS community
        """)
    List<AuthorNodeDTO> findUsersPagerankCommunity();

    @Query("""
          MATCH (a1:Author)-[r:MENTIONS]->(a2:Author)
          RETURN a1.userName AS source, a2.userName AS target
          """)
    List<AuthorLinkDTO> findUserSourceAndTarget();
}

