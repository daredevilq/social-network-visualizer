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
        CREATE (a1)-[r:MENTIONS {weight: totalMentions}]->(a2)
        """)
  void createRelationshipAuthorMentionsAuthor();

  @Query(
      """
        MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_REPLY]->(a2:Author)
        WITH a1, a2, count(t) AS totalReplies
        CREATE (a2)-[r:REPLIES {weight: totalReplies}]->(a1)
        """)
  void createRelationshipAuthorRepliesAuthor();

  @Query(
      """
            MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_PARENT]->(parent:Tweet)<-[:POSTED]-(a2:Author)
            WITH a1, a2, count(t) AS totalRetweets
            CREATE (a1)-[r:RETWEETS {weight: totalRetweets}]->(a2)
        """)
  void createRelationshipAuthorRetweetAuthor();

  @Query(
      """
        MATCH (a:Author)-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
        WITH a, h, count(t) AS totalUses
        CREATE (a)-[r:USES_HASHTAG {weight: totalUses}]->(h)
        """)
  void createRelationshipAuthorUsesHashtag();

  @Query(
      """
        MATCH (a1:Author)-[:USES_HASHTAG]->(h:Hashtag)<-[:USES_HASHTAG]-(a2:Author)
        WHERE id(a1) < id(a2)
        WITH a1, a2, count(h) AS sharedHashtags
        CREATE (a1)-[r:SHARES_HASHTAG {weight: sharedHashtags}]->(a2)
        """)
  void createRelationshipAuthorsShareHashtag();

  @Query(
      """
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'QUOTE'
       CREATE (t)-[r:QUOTED {weight: 1}]->(p)
      """)
  void createQuoteRelationships();

  @Query(
      """
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'REPLY'
       CREATE (t)-[r:REPLY_TO {weight: 1}]->(p)
       """)
  void createReplyToRelationships();

  @Query(
      """
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'RETWEET'
       CREATE (t)-[r:RETWEETED {weight: 1}]->(p)
   """)
  void createRetweetRelationships();

  @Query(
      """
        CREATE INDEX author_community IF NOT EXISTS
        FOR (a:Author) ON (a.community);
    """)
  void createIndexForCommunity();
}
