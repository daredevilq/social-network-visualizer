package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RelationshipRepository extends Neo4jRepository<Author, String>{

    @Query("""
        MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:MENTION]->(a2:Author)
        MERGE (a1)-[:MENTIONS]->(a2)
        """)
    void createRelationshipAuthorMentionsAuthor();

    @Query("""
        MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_REPLY]->(a2:Author)
        MERGE (a2)-[:REPLIES]->(a1)
        """)
    void createRelationshipAuthorRepliesAuthor();

    @Query("""
            MATCH (a1:Author)-[:POSTED]->(t:Tweet)-[:HAS_PARENT]->(parent:Tweet)<-[:POSTED]-(a2:Author)
            MERGE (a1)-[:RETWEETS]->(a2)
        """)
    void createRelationshipAuthorRetweetAuthor();
    @Query("""
        MATCH (a:Author)-[:POSTED]->(t:Tweet)-[:HAS_HASHTAG]->(h:Hashtag)
        MERGE (a)-[:USES_HASHTAG]->(h);
        """)
    void createRelationshipAuthorUsesHashtag();

    @Query("""
        MATCH (a1:Author)-[:USES_HASHTAG]->(h:Hashtag)<-[:USES_HASHTAG]-(a2:Author)
        WHERE a1 <> a2
        MERGE (a1)-[:SHARES_HASHTAG]->(a2);
        """)
    void createRelationshipAuthorsShareHashtag();

    @Query("""
        MATCH (a:Author)-[:POSTED]->(t:Tweet)-[:HAS_CASHTAG]->(h:Cashtag)
        MERGE (a)-[:USES_CASHTAG]->(h);
        """)
    void createRelationshipAuthorUsesCashtag();

    @Query("""
        MATCH (a1:Author)-[:USES_CASHTAG]->(h:Cashtag)<-[:USES_CASHTAG]-(a2:Author)
        WHERE a1 <> a2
        MERGE (a1)-[:SHARES_CASHTAG]->(a2);
        """)
    void createRelationshipAuthorsShareCashtag();

    @Query("""
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'QUOTE'
       MERGE (t)-[:QUOTED]->(p)
      """)
    void createQuoteRelationships();

    @Query("""
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'REPLY'
       MERGE (t)-[:REPLY_TO]->(p)
       """)
    void createReplyTotRelationships();

    @Query("""
       MATCH (t:Tweet)-[:HAS_PARENT]->(p:Tweet)
       WHERE t.objectType = 'RETWEET'
       MERGE (t)-[:RETWEETED]->(p)
   """)
    void createRetweetRelationships();

    @Query("""
        CREATE INDEX author_community IF NOT EXISTS
        FOR (a:Author) ON (a.community);
    """)
    void createIndexForCommunity();
}
