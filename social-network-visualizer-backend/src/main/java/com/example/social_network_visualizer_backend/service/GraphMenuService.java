package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.repository.CommunityRepository;
import com.example.social_network_visualizer_backend.repository.GraphMenuRepository;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class GraphMenuService {
  private GraphMenuRepository graphMenuRepository;
  private CommunityRepository communityRepository;
  private WorkspaceService workspaceService;

  public void addAuthorsLatestTweets(String authorId, int numberOfTweets) {
    graphMenuRepository.addAuthorsLatestTweetsToWorkspace(authorId, numberOfTweets);
  }

  public void addAuthorsCommunity(int communityId, int numberOfAuthors) {
    List<Author> authorsList;
    if (numberOfAuthors > 0) {
      authorsList = communityRepository.findTopAuthorsByCommunityId(communityId, numberOfAuthors);
    } else {
      authorsList = communityRepository.findAuthorsByCommunityId(communityId);
    }

    authorsList.forEach(
        author -> {
          NodeDto authorNode = new NodeDto();
          authorNode.setId(author.getUserName());
          authorNode.setNodeType(NodeType.AUTHOR);
          workspaceService.updateWorkspaceMembership(authorNode, true);
        });
  }
}
