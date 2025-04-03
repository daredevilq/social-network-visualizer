package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.AuthorDegreeCentralityDTO;
import com.example.social_network_visualizer_backend.dto.AuthorLinkDTO;
import com.example.social_network_visualizer_backend.dto.AuthorNodeDTO;
import com.example.social_network_visualizer_backend.model.Tweet;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
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
    List<AuthorLinkDTO> findUserMentions();

    @Query("""
            MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_PARENT]->(parent:Tweet)<-[:POSTED]-(a2:Author)
            MERGE (a1)-[:RETWEETS]->(a2)
        """)
    void createRelationshipAuthorRetweetAuthor();

    @Query("""
            MATCH (a:Author {userName: $authorName})-[:POSTED]->(t:Tweet)
            WITH a, t
            RETURN datetime(t.publicationDate) AS activityDate
            ORDER BY activityDate DESC
        """)
    List<ZonedDateTime> getUserActivity(@Param("authorName") String authorName);

    @Query("""
      CALL gds.graph.project(
          'author-importance',
          'Author',
          {
            RETWEET: { type: 'RETWEETS', orientation: 'NATURAL' },
            MENTIONS: { type: 'MENTIONS', orientation: 'NATURAL' }
          }
    ) YIELD graphName
    RETURN graphName;
    """)
    void createImportanceGraph();

    @Query("""
        CALL gds.degree.write('author-importance', {
          writeProperty: 'degreeCentrality'
        }) YIELD nodePropertiesWritten
        RETURN nodePropertiesWritten;
    """)
    void computeAuthorDegree();

    @Query("""
            MATCH (a:Author)
            WHERE a.degreeCentrality IS NOT NULL
            RETURN a.userName AS userName, a.degreeCentrality AS degreeCentrality
        """)
    List<AuthorDegreeCentralityDTO> findUsersDegreeCentrality();

    @Query("""
              MATCH (a1:Author)-[r:RETWEETS]->(a2:Author)
              RETURN a1.userName AS source, a2.userName AS target
          """)
    List<AuthorLinkDTO> findUserRetweets();

    @Query("""
               MATCH (a1:Author {userName: $sourceName}), (a2:Author {userName: $targetName})
               CALL gds.shortestPath.dijkstra.stream('author-importance', {
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
}

