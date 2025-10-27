package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.HashtagNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.TweetNodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.repository.CommunityRepository;
import com.example.social_network_visualizer_backend.repository.GraphMenuRepository;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class GraphMenuService {
  private final GraphMenuRepository graphMenuRepository;
  private final WorkspaceService workspaceService;
  private final CommunityRepository communityRepository;

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

  public void addTweetAuthorToWorkspace(TweetNodeDto tweetNodeDto) {
    AuthorNodeDto author =
        graphMenuRepository
            .findAuthorByTweetId(tweetNodeDto.getId())
            .orElseThrow(
                () ->
                    new ProjectException(
                        "Author not found for tweet: " + tweetNodeDto.getId(),
                        HttpStatus.NOT_FOUND));

    workspaceService.updateWorkspaceMembership(author, true);
  }

  public void addTweetHashtagsToWorkspace(TweetNodeDto tweetNodeDto) {
    List<HashtagNodeDto> hashtags = graphMenuRepository.findHashtagsByTweetId(tweetNodeDto.getId());
    hashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addMentionedAuthorsToWorkspace(TweetNodeDto tweetNodeDto) {
    List<AuthorNodeDto> authors =
        graphMenuRepository.findMentionedAuthorsByTweetId(tweetNodeDto.getId());
    authors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addTopAuthorsForHashtag(HashtagNodeDto hashtagNodeDto) {
    List<AuthorNodeDto> authors =
        graphMenuRepository.findTopAuthorsByHashtagId(hashtagNodeDto.getId());
    authors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addTopTweetsByHashtag(HashtagNodeDto hashtagNodeDto) {
    List<TweetNodeDto> tweets =
        graphMenuRepository.findTopTweetsByHashtagId(hashtagNodeDto.getId());
    tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }
}
