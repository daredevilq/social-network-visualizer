package com.example.social_network_visualizer_backend.service.graph;

import com.example.social_network_visualizer_backend.dto.graph.graphNode.AuthorNodeDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthorNodeQueryStrategy implements NodeQueryStrategy {

  private final AuthorRepository authorRepository;

  @Override
  public List<? extends NodeDto> fetchNodes(Optional<Integer> communityId, boolean inWorkspace) {
    if (communityId.isPresent()) {
      return authorRepository.findAuthorsWithCommunity(communityId.get());
    } else {
      return authorRepository.findAuthors(inWorkspace).stream()
          .sorted(Comparator.comparingDouble(AuthorNodeDto::getPagerank).reversed())
          .collect(Collectors.toList());
    }
  }

  @Override
  public NodeType getNodeType() {
    return NodeType.AUTHOR;
  }
}
