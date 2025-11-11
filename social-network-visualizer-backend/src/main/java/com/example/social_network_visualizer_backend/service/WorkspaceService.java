package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.workspace.WorkspaceImportResult;
import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.WorkspaceImportResultStatus;
import com.example.social_network_visualizer_backend.exceptions.ProjectException;
import com.example.social_network_visualizer_backend.exceptions.WorkspaceException;
import com.example.social_network_visualizer_backend.model.project.Project;
import com.example.social_network_visualizer_backend.model.project.Workspace;
import com.example.social_network_visualizer_backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {
  private final ProjectRepository projectRepository;
  private final GraphRepository graphRepository;
  private final AuthorRepository authorRepository;
  private final TweetRepository tweetRepository;
  private final HashtagRepository hashtagRepository;
  private final ObjectMapper objectMapper;

  public List<String> getAllWorkspaces(String projectName) {
    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getWorkspaces() == null || project.getWorkspaces().isEmpty()) {
      log.warn("Project '{}' has no workspaces", projectName);
      return Collections.emptyList();
    }

    List<String> workspaces = project.getWorkspaces().stream().map(Workspace::getName).toList();

    log.info("Found {} workspaces for project '{}'", workspaces.size(), projectName);
    return workspaces;
  }

  public void saveWorkspace(String projectName, Workspace workspaceData) {
    if (workspaceData.getName() == null || workspaceData.getName().isBlank()) {
      log.error("Workspace name is null or blank for project '{}'", projectName);
      throw new ProjectException("Workspace name cannot be null or empty", HttpStatus.BAD_REQUEST);
    }

    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getWorkspaces() == null) {
      project.setWorkspaces(new ArrayList<>());
    }

    boolean updated = false;
    List<Workspace> workspaces = project.getWorkspaces();
    for (int i = 0; i < workspaces.size(); i++) {
      Workspace ws = workspaces.get(i);
      if (ws.getName() != null && ws.getName().equalsIgnoreCase(workspaceData.getName())) {
        log.info(
            "Updating existing workspace '{}' in project '{}'",
            workspaceData.getName(),
            projectName);
        workspaces.set(i, workspaceData);
        updated = true;
        break;
      }
    }

    if (!updated) {
      log.info("Adding new workspace '{}' to project '{}'", workspaceData.getName(), projectName);
      workspaces.add(workspaceData);
    }

    projectRepository.save(project);
  }

  public void loadWorkspace(String projectName, String workspaceName) {
    clearWorkspaceMembership();

    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    Workspace workspace =
        project.getWorkspaces().stream()
            .filter(ws -> ws.getName().equalsIgnoreCase(workspaceName))
            .findFirst()
            .orElseThrow(
                () -> {
                  log.error("Workspace '{}' not found in project '{}'", workspaceName, projectName);
                  return new ProjectException(
                      "Workspace with name '"
                          + workspaceName
                          + "' not found in project '"
                          + projectName
                          + "'",
                      HttpStatus.NOT_FOUND);
                });

    workspace.getNodes().forEach(node -> updateWorkspaceMembership(node, true));

    log.info("Workspace '{}' loaded successfully from project '{}'", workspaceName, projectName);
  }

  private void clearWorkspaceMembership() {
    graphRepository.clearWorkspaceMembership();
  }

  public void deleteWorkspace(String projectName, String workspaceName) {
    if (workspaceName == null || workspaceName.isBlank()) {
      log.warn("Node or node type is null – cannot update workspace flag.");
      throw new ProjectException("Workspace name cannot be null or empty", HttpStatus.BAD_REQUEST);
    }

    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () -> {
                  log.error("Project with name '{}' does not exist", projectName);
                  return new ProjectException(
                      "Project with name '" + projectName + "' does not exist",
                      HttpStatus.NOT_FOUND);
                });

    if (project.getWorkspaces() == null || project.getWorkspaces().isEmpty()) {
      log.warn("Project '{}' has no workspaces to delete", projectName);
      throw new ProjectException(
          "Project '" + projectName + "' has no workspaces", HttpStatus.NOT_FOUND);
    }

    Workspace deletedWorkspace = null;

    for (int i = 0; i < project.getWorkspaces().size(); i++) {
      Workspace workspace = project.getWorkspaces().get(i);
      if (workspace.getName() != null && workspace.getName().equalsIgnoreCase(workspaceName)) {
        deletedWorkspace = workspace;
        project.getWorkspaces().remove(i);
        log.info("Workspace '{}' deleted from project '{}'", workspaceName, projectName);
        break;
      }
    }

    if (deletedWorkspace == null) {
      log.error("Workspace '{}' does not exist in project '{}'", workspaceName, projectName);
      throw new ProjectException(
          "Workspace with name '"
              + workspaceName
              + "' does not exist in project '"
              + projectName
              + "'",
          HttpStatus.NOT_FOUND);
    }

    projectRepository.save(project);
  }

  public Workspace getWorkspaceByName(String projectName, String workspaceName) {
    if (workspaceName == null || workspaceName.isBlank()) {
      throw new ProjectException("Workspace name cannot be null or empty", HttpStatus.BAD_REQUEST);
    }

    Project project =
        projectRepository
            .findWorkspaceByProjectNameAndWorkspaceName(projectName, workspaceName)
            .orElseThrow(
                () -> {
                  log.error("Workspace '{}' not found in project '{}'", workspaceName, projectName);
                  return new ProjectException(
                      "Workspace with name " + workspaceName + " not found in project",
                      HttpStatus.NOT_FOUND);
                });

    Workspace workspace = project.getWorkspaces().get(0);
    log.info("Workspace '{}' retrieved successfully from project '{}'", workspaceName, projectName);
    return workspace;
  }

  public Workspace getWorkspaceByNameWithFullNodes(String projectName, String workspaceName) {
    Workspace workspace = getWorkspaceByName(projectName, workspaceName);

    List<NodeDto> entireNodes = getNodesWithFullData(workspace.getNodes());

    Workspace enrichedWorkspace =
        Workspace.builder()
            .name(workspace.getName())
            .nodes(entireNodes)
            .edges(workspace.getEdges())
            .build();

    log.info("Workspace '{}' enriched with full node data for export", workspaceName);
    return enrichedWorkspace;
  }

  private List<NodeDto> getNodesWithFullData(List<NodeDto> nodes) {
    if (nodes == null || nodes.isEmpty()) {
      return Collections.emptyList();
    }

    Map<NodeType, Set<String>> nodeIdsByType = groupNodeIdsByType(nodes);
    List<NodeDto> entireNodes = new ArrayList<>();

    getEntireAuthorNodes(nodeIdsByType, entireNodes);
    getEntireTweetsNodes(nodeIdsByType, entireNodes);
    getEntireHashtagNodes(nodeIdsByType, entireNodes);

    return entireNodes;
  }

  private void getEntireHashtagNodes(
      Map<NodeType, Set<String>> nodeIdsByType, List<NodeDto> entireNodes) {
    if (nodeIdsByType.containsKey(NodeType.HASHTAG)) {
      Set<String> hashtagIds = nodeIdsByType.get(NodeType.HASHTAG);
      List<NodeDto> fullHashtagNodes =
          hashtagRepository.findFullHashtagNodesByIds(hashtagIds).stream()
              .map(node -> (NodeDto) node)
              .toList();
      entireNodes.addAll(fullHashtagNodes);
      log.debug("Enriched {} hashtag nodes", fullHashtagNodes.size());
    }
  }

  private void getEntireTweetsNodes(
      Map<NodeType, Set<String>> nodeIdsByType, List<NodeDto> entireNodes) {
    if (nodeIdsByType.containsKey(NodeType.TWEET)) {
      Set<String> tweetIds = nodeIdsByType.get(NodeType.TWEET);
      List<NodeDto> fullTweetNodes =
          tweetRepository.findFullTweetNodesByIds(tweetIds).stream()
              .map(node -> (NodeDto) node)
              .toList();
      entireNodes.addAll(fullTweetNodes);
      log.debug("Enriched {} tweet nodes", fullTweetNodes.size());
    }
  }

  private void getEntireAuthorNodes(
      Map<NodeType, Set<String>> nodeIdsByType, List<NodeDto> entireNodes) {
    if (nodeIdsByType.containsKey(NodeType.AUTHOR)) {
      Set<String> authorIds = nodeIdsByType.get(NodeType.AUTHOR);
      List<NodeDto> fullAuthorNodes =
          authorRepository.findFullAuthorNodesByIds(authorIds).stream()
              .map(node -> (NodeDto) node)
              .toList();
      entireNodes.addAll(fullAuthorNodes);
      log.debug("Enriched {} author nodes", fullAuthorNodes.size());
    }
  }

  public void updateWorkspaceMembership(NodeDto node, boolean isInWorkspace) {
    if (node == null || node.getNodeType() == null) {
      log.warn("Node or node type is null – cannot update workspace flag.");
      return;
    }

    switch (node.getNodeType()) {
      case NodeType.AUTHOR:
        authorRepository
            .findById(node.getId())
            .ifPresentOrElse(
                author -> {
                  author.setIsInWorkspace(isInWorkspace);
                  authorRepository.save(author);
                },
                () -> log.warn("Author not found: {}", node.getId()));
        break;

      case NodeType.TWEET:
        tweetRepository
            .findById(node.getId())
            .ifPresentOrElse(
                tweet -> {
                  tweet.setIsInWorkspace(isInWorkspace);
                  tweetRepository.save(tweet);
                },
                () -> log.warn("Tweet not found: {}", node.getId()));
        break;

      case NodeType.HASHTAG:
        hashtagRepository
            .findById(node.getId())
            .ifPresentOrElse(
                hashtag -> {
                  hashtag.setIsInWorkspace(isInWorkspace);
                  hashtagRepository.save(hashtag);
                },
                () -> log.warn("Hashtag not found: {}", node.getId()));
        break;

      default:
        log.warn("Unknown node type: {}", node.getNodeType());
    }
  }

  public WorkspaceImportResult validateAndImportWorkspace(
      String projectName, MultipartFile workspaceFile) {

    Workspace workspaceCandidate = parseAndValidateWorkspaceFileFormat(workspaceFile);
    verifyProjectAndWorkspaceUniqueness(projectName, workspaceCandidate);

    List<NodeDto> validNodes = extractValidNodes(workspaceCandidate);
    List<LinkDto> validEdges = extractValidEdges(workspaceCandidate, validNodes);

    if (validNodes.isEmpty() && validEdges.isEmpty()) {
      throw new WorkspaceException(
          "Failed to import workspace: No valid nodes or edges found in the database.",
          HttpStatus.BAD_REQUEST,
          WorkspaceImportResultStatus.ERROR.getLabel());
    }

    Workspace validWorkspace =
        Workspace.builder()
            .name(workspaceCandidate.getName())
            .nodes(validNodes)
            .edges(validEdges)
            .build();
    saveWorkspace(projectName, validWorkspace);

    return WorkspaceImportResult.fromImportStats(
        workspaceCandidate.getName(),
        workspaceCandidate.getNodes() != null ? workspaceCandidate.getNodes().size() : 0,
        validNodes.size(),
        workspaceCandidate.getEdges() != null ? workspaceCandidate.getEdges().size() : 0,
        validEdges.size());
  }

  private List<LinkDto> extractValidEdges(Workspace workspaceCandidate, List<NodeDto> validNodes) {

    Set<String> validNodeIds = validNodes.stream().map(NodeDto::getId).collect(Collectors.toSet());

    List<LinkDto> edgesToValidate =
        workspaceCandidate.getEdges() == null
            ? Collections.emptyList()
            : workspaceCandidate.getEdges().stream()
                .filter(edge -> edge != null && edge.source() != null && edge.target() != null)
                .filter(
                    edge ->
                        validNodeIds.contains(edge.source())
                            && validNodeIds.contains(edge.target()))
                .toList();

    List<LinkDto> validEdges = Collections.emptyList();
    if (!edgesToValidate.isEmpty()) {
      List<Map<String, String>> edgeMaps =
          edgesToValidate.stream()
              .map(
                  edge -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("source", edge.source());
                    map.put("target", edge.target());
                    map.put("relation", edge.relation().toString());
                    return map;
                  })
              .toList();
      validEdges = graphRepository.findExistingRelations(edgeMaps);
    }
    return validEdges;
  }

  private List<NodeDto> extractValidNodes(Workspace workspace) {
    if (workspace.getNodes() == null || workspace.getNodes().isEmpty()) {
      return Collections.emptyList();
    }

    List<Map<String, String>> nodeInputs =
        workspace.getNodes().stream()
            .filter(node -> node != null && node.getId() != null && node.getNodeType() != null)
            .map(
                node -> {
                  Map<String, String> map = new HashMap<>();
                  map.put("id", node.getId());
                  map.put("nodeType", node.getNodeType().toString());
                  return map;
                })
            .toList();

    if (nodeInputs.isEmpty()) {
      return Collections.emptyList();
    }

    return graphRepository.findExistingNodesByIdsAndTypes(nodeInputs);
  }

  private Map<NodeType, Set<String>> groupNodeIdsByType(List<NodeDto> nodes) {
    if (nodes == null) {
      return Collections.emptyMap();
    }

    return nodes.stream()
        .filter(node -> node != null && node.getId() != null && node.getNodeType() != null)
        .collect(
            Collectors.groupingBy(
                NodeDto::getNodeType, Collectors.mapping(NodeDto::getId, Collectors.toSet())));
  }

  private Workspace parseAndValidateWorkspaceFileFormat(MultipartFile file) {
    String filename = file.getOriginalFilename();
    if (filename == null || !filename.endsWith(".json")) {
      throw new WorkspaceException("Only JSON files are allowed", HttpStatus.BAD_REQUEST);
    }

    Workspace workspace;
    try {
      workspace = objectMapper.readValue(file.getInputStream(), Workspace.class);
    } catch (Exception e) {
      log.error("IO error reading workspace file: {}", e.getMessage());
      throw new WorkspaceException(
          "Failed to read workspace file. The file may be corrupted.", e, HttpStatus.BAD_REQUEST);
    }

    if (workspace == null || workspace.getName() == null || workspace.getName().isBlank()) {
      throw new WorkspaceException("Invalid workspace: name is required", HttpStatus.BAD_REQUEST);
    }
    if (workspace.getNodes() == null) {
      workspace.setNodes(new ArrayList<>());
    }
    if (workspace.getEdges() == null) {
      workspace.setEdges(new ArrayList<>());
    }

    return workspace;
  }

  private void verifyProjectAndWorkspaceUniqueness(String projectName, Workspace workspace) {
    Project project =
        projectRepository
            .findByName(projectName)
            .orElseThrow(
                () ->
                    new WorkspaceException(
                        "Project with name '" + projectName + "' does not exist",
                        HttpStatus.NOT_FOUND));

    boolean workspaceExists =
        project.getWorkspaces() != null
            && project.getWorkspaces().stream()
                .anyMatch(
                    ws ->
                        ws.getName() != null && ws.getName().equalsIgnoreCase(workspace.getName()));

    if (workspaceExists) {
      throw new WorkspaceException(
          "Workspace with name '" + workspace.getName() + "' already exists in project '",
          HttpStatus.CONFLICT);
    }
  }
}
