package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RelationshipRepository extends Neo4jRepository<Author, String> {

  @Query(
      """
        MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:MENTION]->(a2:Author)
        WITH a1, a2, count(t) AS totalMentions
        MERGE (a1)-[r:MENTIONS]->(a2)
        SET r.weight = totalMentions
        """)
  void createRelationshipAuthorMentionsAuthor();

  @Query(
      """
        MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_REPLY]->(a2:Author)
        WITH a1, a2, count(t) AS totalReplies
        MERGE (a2)-[r:REPLIES]->(a1)
        SET r.weight = totalReplies
        """)
  void createRelationshipAuthorRepliesAuthor();

  @Query(
      """
            MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_PARENT]->(parent:Tweet)<-[:POSTED]-(a2:Author)
            WITH a1, a2, count(t) AS totalRetweets
            MERGE (a1)-[r:RETWEETS]->(a2)
            SET r.weight = totalRetweets
        """)
  void createRelationshipAuthorRetweetAuthor();

  @Query(
      """
        MATCH (a:Author)-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
        WITH a, h, count(t) AS totalUses
        MERGE (a)-[r:USES_HASHTAG]->(h)
        SET r.weight = totalUses
        """)
  void createRelationshipAuthorUsesHashtag();

  @Query(
      """
        MATCH (a1:Author)-[:USES_HASHTAG]->(h:Hashtag)<-[:USES_HASHTAG]-(a2:Author)
        WHERE id(a1) < id(a2)
        WITH a1, a2, count(h) AS sharedHashtags
        MERGE (a1)-[r:SHARES_HASHTAG]-(a2)
        SET r.weight = sharedHashtags
        """)
  void createRelationshipAuthorsShareHashtag();

  @Query(
      """
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'QUOTE'
       MERGE (t)-[r:QUOTED]->(p)
       ON CREATE SET r.weight = 1
      """)
  void createQuoteRelationships();

  @Query(
      """
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'REPLY'
       MERGE (t)-[r:REPLY_TO]->(p)
       ON CREATE SET r.weight = 1
       """)
  void createReplyToRelationships();

  @Query(
      """
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'RETWEET'
       MERGE (t)-[r:RETWEETED]->(p)
       ON CREATE SET r.weight = 1
   """)
  void createRetweetRelationships();

  @Query(
      """
        CREATE INDEX author_community IF NOT EXISTS
        FOR (a:Author) ON (a.community);
    """)
  void createIndexForCommunity();
}
