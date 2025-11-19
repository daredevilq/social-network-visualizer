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
          List<TweetNodeDto> tweets =
              graphMenuRepository.findAuthorLatestTweets(author.getId(), numberOfTweets);
          tweets.forEach(tweet -> workspaceService.updateWorkspaceMembership(tweet, true));
        });
  }

  public void addAuthorsMostPopularTweets(List<AuthorNodeDto> authors, int numberOfTweets) {
    authors.forEach(
        author -> {
          List<TweetNodeDto> tweets =
              graphMenuRepository.findAuthorMostPopularTweets(author.getId(), numberOfTweets);
          tweets.forEach(tweet -> workspaceService.updateWorkspaceMembership(tweet, true));
        });
  }

  public void addAuthorsCommunities(List<AuthorNodeDto> authors, Optional<Integer> nodeNumber) {
    Set<Integer> uniqueCommunities =
        authors.stream()
            .map(author -> communityRepository.findCommunityIdByAuthorId(author.getId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toSet());

    uniqueCommunities.forEach(
        communityId -> {
          List<Author> communityAuthors =
              nodeNumber.isPresent()
                  ? communityRepository.findAuthorsByCommunityWithLimit(
                      communityId, nodeNumber.get())
                  : communityRepository.findAuthorsByCommunity(communityId);

          communityAuthors.forEach(
              commAuthor -> {
                NodeDto authorNode = new NodeDto();
                authorNode.setId(commAuthor.getUserName());
                authorNode.setNodeType(NodeType.AUTHOR);
                workspaceService.updateWorkspaceMembership(authorNode, true);
              });
        });
  }

  public void addHashtagsUsedByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<HashtagNodeDto> hashtags =
              graphMenuRepository.findHashtagsUsedByAuthor(author.getId());
          hashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addCommonHashtagUsedByAuthors(List<AuthorNodeDto> authors) {
    List<String> authorIds = authors.stream().map(AuthorNodeDto::getId).toList();

    List<HashtagNodeDto> commonHashtags =
        graphMenuRepository.findTopCommonHashtagsUsedByAuthors(authorIds);

    commonHashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addMentionedUsersByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<AuthorNodeDto> mentionedAuthors =
              graphMenuRepository.findMentionedUsersByAuthor(author.getId());
          mentionedAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addAuthorsMentioningTheseAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<AuthorNodeDto> mentioningAuthors =
              graphMenuRepository.findAuthorsMentioningThisAuthor(author.getId());
          mentioningAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addAuthorsMostRepliedToByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<AuthorNodeDto> repliedAuthors =
              graphMenuRepository.findAuthorsMostRepliedToByAuthor(author.getId());
          repliedAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addAuthorsMostReplyingToAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<AuthorNodeDto> replyingAuthors =
              graphMenuRepository.findAuthorsMostReplyingToAuthor(author.getId());
          replyingAuthors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetsRepliedToByAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<TweetNodeDto> tweets =
              graphMenuRepository.findTweetsRepliedToByAuthor(author.getId());
          tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetsMentioningAuthors(List<AuthorNodeDto> authors) {
    authors.forEach(
        author -> {
          List<TweetNodeDto> tweets =
              graphMenuRepository.findTweetsMentioningAuthor(author.getId());
          tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetAuthorsToWorkspace(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          AuthorNodeDto author =
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
          List<HashtagNodeDto> hashtags = graphMenuRepository.findHashtagsByTweetId(tweet.getId());
          hashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTweetsCommonHashtagsToWorkspace(List<TweetNodeDto> tweets) {
    List<String> tweetIds = tweets.stream().map(TweetNodeDto::getId).toList();

    List<HashtagNodeDto> commonHashtags =
        graphMenuRepository.findCommonHashtagsByTweetIds(tweetIds);

    commonHashtags.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
  }

  public void addMentionedAuthorsFromTweets(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          List<AuthorNodeDto> authors =
              graphMenuRepository.findMentionedAuthorsByTweetId(tweet.getId());
          authors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addParentTweetsToWorkspace(List<TweetNodeDto> tweets) {
    tweets.forEach(
        tweet -> {
          TweetNodeDto parent =
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
          List<TweetNodeDto> children = graphMenuRepository.findChildrenByTweetId(tweet.getId());
          children.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTopAuthorsForHashtags(List<HashtagNodeDto> hashtags) {
    hashtags.forEach(
        hashtag -> {
          List<AuthorNodeDto> authors =
              graphMenuRepository.findTopAuthorsByHashtagId(hashtag.getId());
          authors.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addTopTweetsByHashtags(List<HashtagNodeDto> hashtags) {
    hashtags.forEach(
        hashtag -> {
          List<TweetNodeDto> tweets = graphMenuRepository.findTopTweetsByHashtagId(hashtag.getId());
          tweets.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }

  public void addRelatedHashtags(List<HashtagNodeDto> hashtags) {
    hashtags.forEach(
        hashtag -> {
          List<HashtagNodeDto> related = graphMenuRepository.findRelatedHashtags(hashtag.getId());
          related.forEach(node -> workspaceService.updateWorkspaceMembership(node, true));
        });
  }
}
