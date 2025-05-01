package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.BridgeDto;
import com.example.social_network_visualizer_backend.model.Author;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlgorithmRepository extends Neo4jRepository<Author, String> {
    @Query("""
            CALL gds.bridges.stream('author-importance')
            YIELD from, to
            RETURN gds.util.asNode(from).userName AS source, gds.util.asNode(to).userName AS target
            """)
    List<BridgeDto> getAllBridges();

    @Query("""
        CALL gds.pageRank.write($graphName, {
            writeProperty: 'pagerank'
        }) YIELD nodePropertiesWritten
        RETURN 1
    """)
    void computePageRank(@Param("graphName") String graphName);

    @Query("""
        CALL gds.labelPropagation.write($graphName, {
            writeProperty: 'community'
        }) YIELD communityCount
        RETURN 1
        """)
    void createCommunities(@Param("graphName") String graphName);

    @Query("""
        CALL gds.degree.write($graphName, {
          writeProperty: 'degreeCentrality'
        }) YIELD nodePropertiesWritten
        RETURN nodePropertiesWritten;
    """)
    void computeAuthorDegree(@Param("graphName") String graphName);
}
