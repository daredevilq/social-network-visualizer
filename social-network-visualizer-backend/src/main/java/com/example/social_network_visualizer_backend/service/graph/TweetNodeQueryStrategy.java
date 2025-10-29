package com.example.social_network_visualizer_backend.service.graph;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TweetNodeQueryStrategy implements NodeQueryStrategy {

  private final TweetRepository tweetRepository;

  @Override
  public List<? extends NodeDto> fetchNodes(
      Optional<Integer> communityId, boolean inWorkspace, Integer limit) {

    return tweetRepository.findTweets(inWorkspace, limit);
  }

  @Override
  public NodeType getNodeType() {
    return NodeType.TWEET;
  }
}
