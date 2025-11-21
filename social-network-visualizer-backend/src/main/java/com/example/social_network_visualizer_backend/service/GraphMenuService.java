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
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
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

  public void addAuthorsLatestTweets(List<AuthorNodeDto> authors, int numberOfTweets) {
    authors.forEach(
        author -> {
          List<NodeDto> tweets =
              graphMenuRepository.findAuthorLatestTweets(author.getName(), numberOfTweets);
          tweets.forEach(tweet -> workspaceService.updateWorkspaceMembership(tweet, true));
        });
  }

  public void addAuthorsMostPopularTweets(List<AuthorNodeDto> authors, int numberOfTweets) {
    authors.forEach(
        author -> {
          List<NodeDto> tweets =
              graphMenuRepository.findAuthorMostPopularTweets(author.getName(), numberOfTweets);
          tweets.forEach(tweet -> workspaceService.updateWorkspaceMembership(tweet, true));
        });
  }

  public void addAuthorsCommunities(List<AuthorNodeDto> authors, Optional<Integer> nodeNumber) {
    log.info("========== INPUT AUTHORS ==========");
    authors.forEach(
        author -> {
          log.info("Author ID: {}", author.getId());
          log.info("  Name: {}", author.getName());
          log.info("  NodeType: {}", author.getNodeType());
          log.info("  Pagerank: {}", author.getPagerank());
          log.info("  Community: {}", author.getCommunity());
          log.info("---");
        });
    log.info("===================================");

    Set<Integer> uniqueCommunities =
        authors.stream()
            .map(author -> communityRepository.findCommunityIdByAuthorId(author.getName()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toSet());

    log.info("===================================");

    uniqueCommunities.forEach(
        communityId -> {
          List<Author> communityAuthors =
              nodeNumber.isPresent()
                  ? communityRepository.findAuthorsByCommunityWithLimit(
                      communityId, nodeNumber.get())
                  : communityRepository.findAuthorsByCommunity(communityId);

          log.info("========== COMMUNITY {} AUTHORS ==========", communityId);
          communityAuthors.forEach(
              commAuthor -> {
                log.info("Author from DB:");
                log.info("  ID: {}", commAuthor.getId());
                log.info("  UserName: {}", commAuthor.getUserName());
                log.info("  DisplayName: {}", commAuthor.getDisplayName());
                log.info("  Name: {}", commAuthor.getName());
                log.info("  ForeignId: {}", commAuthor.getForeignId());
                log.info("  Bot: {}", commAuthor.getBot());
                log.info("  Pagerank: {}", commAuthor.getPagerank());
                log.info("  Community: {}", commAuthor.getCommunity());
                log.info("  IsInWorkspace: {}", commAuthor.getIsInWorkspace());
                log.info("---");
              });
          log.info("===========================================");

          communityAuthors.forEach(
              commAuthor -> {
                NodeDto authorNode = new NodeDto();
                authorNode.setId(commAuthor.getId());
                authorNode.setName(commAuthor.getUserName());
                authorNode.setNodeType(NodeType.AUTHOR);
                workspaceService.updateWorkspaceMembership(authorNode, true);
              });
        });
  }

  public void addHashtagsUsedByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> hashtags = graphMenuRepository.findHashtagsUsedByAuthor(author.getName());
          hashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addCommonHashtagUsedByAuthors(List<AuthorNodeDto> authors) {
    List<String> authorUserNames = authors.stream().map(AuthorNodeDto::getName).toList();

    List<NodeDto> commonHashtags =
        graphMenuRepository.findTopCommonHashtagsUsedByAuthors(authorUserNames);

    commonHashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addMentionedUsersByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> mentionedAuthors =
              graphMenuRepository.findMentionedUsersByAuthor(author.getName());
          mentionedAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addAuthorsMentioningTheseAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> mentioningAuthors =
              graphMenuRepository.findAuthorsMentioningThisAuthor(author.getName());
          mentioningAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addAuthorsMostRepliedToByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> repliedAuthors =
              graphMenuRepository.findAuthorsMostRepliedToByAuthor(author.getName());
          repliedAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addAuthorsMostReplyingToAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> replyingAuthors =
              graphMenuRepository.findAuthorsMostReplyingToAuthor(author.getName());
          replyingAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetsRepliedToByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> tweets = graphMenuRepository.findTweetsRepliedToByAuthor(author.getName());
          tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetsMentioningAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<NodeDto> tweets = graphMenuRepository.findTweetsMentioningAuthor(author.getName());
          tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetAuthorsToWorkspace(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          NodeDto author =
              graphMenuRepository
                  .findAuthorByTweetId(tweet.getId())
                  .orElseThrow(
                      () ->
                          new ProjectException(
                              "Author not found for tweet: " + tweet.getId(),
                              HttpStatus.NOT_FOUND));
          workspaceService.updateWorkspaceMembership(author, true);
        });
  }

  public void addTweetHashtagsToWorkspace(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          List<NodeDto> hashtags = graphMenuRepository.findHashtagsByTweetId(tweet.getId());
          hashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetsCommonHashtagsToWorkspace(List<TweetNodeDto> tweets) {
    List<String> tweetIds = tweets.stream().map(TweetNodeDto::getId).toList();

    List<NodeDto> commonHashtags = graphMenuRepository.findCommonHashtagsByTweetIds(tweetIds);

    commonHashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addMentionedAuthorsFromTweets(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          List<NodeDto> authors = graphMenuRepository.findMentionedAuthorsByTweetId(tweet.getId());
          authors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addParentTweetsToWorkspace(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          NodeDto parent =
              graphMenuRepository
                  .findParentByTweetId(tweet.getId())
                  .orElseThrow(
                      () ->
                          new ProjectException(
                              "Parent not found for tweet: " + tweet.getId(),
                              HttpStatus.NOT_FOUND));
          workspaceService.updateWorkspaceMembership(parent, true);
        });
  }

  public void addTweetChildrenToWorkspace(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          List<NodeDto> children = graphMenuRepository.findChildrenByTweetId(tweet.getId());
          children.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTopAuthorsForHashtags(List<HashtagNodeDto> hashtags) {
    hashtags.forEach(
        hashtag -> {
          List<NodeDto> authors = graphMenuRepository.findTopAuthorsByHashtag(hashtag.getName());
          authors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTopTweetsByHashtags(List<HashtagNodeDto> hashtags) {
    hashtags.forEach(
        hashtag -> {
          List<NodeDto> tweets = graphMenuRepository.findTopTweetsByHashtag(hashtag.getName());
          tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addRelatedHashtags(List<HashtagNodeDto> hashtags) {
    hashtags.forEach(
        hashtag -> {
          List<NodeDto> related = graphMenuRepository.findRelatedHashtags(hashtag.getName());
          related.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }
}
