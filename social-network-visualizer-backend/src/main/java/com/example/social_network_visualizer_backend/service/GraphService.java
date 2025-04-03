package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDegreeCentralityDTO;
import com.example.social_network_visualizer_backend.dto.AuthorLinkDTO;
import com.example.social_network_visualizer_backend.dto.AuthorNodeDTO;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GraphService {

    private final AuthorRepository authorRepository;

    public Map<String, Object> getAuthorMentionsGraph() {
        List<AuthorNodeDTO> nodesRaw = authorRepository.findUsersPagerankCommunity();
        List<AuthorLinkDTO> linksRaw = authorRepository.findUserMentions();

        Map<String, Object> result = new HashMap<>();
        result.put("nodes", nodesRaw);
        result.put("links", linksRaw);

        return result;
    }


    public Map<String, Object> getAuthorImportanceGraph() {
        List<AuthorDegreeCentralityDTO> nodesRaw = authorRepository.findUsersDegreeCentrality();
        List<AuthorLinkDTO> mentionsRaw = authorRepository.findUserMentions();
        List<AuthorLinkDTO> retweetsRaw = authorRepository.findUserRetweets();

        Map<String, Object> result = new HashMap<>();
        result.put("nodes", nodesRaw);
        result.put("mentions", mentionsRaw);
        result.put("retweets", retweetsRaw);

        return result;
    }
}

