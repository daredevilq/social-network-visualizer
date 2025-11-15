package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.graph.LinkDto;
import com.example.social_network_visualizer_backend.dto.graph.graphNode.NodeDto;
import com.example.social_network_visualizer_backend.dto.workspace.WorkspaceImportResult;
import com.example.social_network_visualizer_backend.enums.NodeType;
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
      Workspace workspace = workspaces.get(i);
      if (workspace.getName() != null
          && workspace.getName().equalsIgnoreCase(workspaceData.getName())) {
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

    Workspace workspaceToLoad =
        project.getWorkspaces().stream()
            .filter(workspace -> workspace.getName().equalsIgnoreCase(workspaceName))
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

    workspaceToLoad.getNodes().forEach(node -> updateWorkspaceMembership(node, true));

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

    nodeIdsByType.forEach((nodeType, ids) -> enrichNodesForType(nodeType, ids, entireNodes));

    return entireNodes;
  }

  private void enrichNodesForType(NodeType nodeType, Set<String> ids, List<NodeDto> entireNodes) {
    if (ids == null || ids.isEmpty()) {
      return;
    }
    List<NodeDto> fullNodes =
        switch (nodeType) {
          case AUTHOR -> authorRepository.findFullAuthorNodesByIds(ids).stream()
              .map(node -> (NodeDto) node)
              .toList();
          case TWEET -> tweetRepository.findFullTweetNodesByIds(ids).stream()
              .map(node -> (NodeDto) node)
              .toList();
          case HASHTAG -> hashtagRepository.findFullHashtagNodesByIds(ids).stream()
              .map(node -> (NodeDto) node)
              .toList();
        };

    entireNodes.addAll(fullNodes);
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

  public void updateWorkspaceMembership(List<NodeDto> nodes, boolean isInWorkspace) {
    nodes.forEach(node -> updateWorkspaceMembership(node, isInWorkspace));
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
          HttpStatus.BAD_REQUEST);
    }

    Workspace validWorkspace =
        Workspace.builder()
            .name(workspaceCandidate.getName())
            .nodes(validNodes)
            .edges(validEdges)
            .build();
    saveWorkspace(projectName, validWorkspace);

    int totalNodes = workspaceCandidate.getNodes().size();
    int importedNodes = validNodes.size();
    int totalEdges = workspaceCandidate.getEdges().size();
    int importedEdges = validEdges.size();

    log.info(
        "Workspace '{}' imported: {}/{} nodes, {}/{} edges",
        workspaceCandidate.getName(),
        importedNodes,
        totalNodes,
        importedEdges,
        totalEdges);

    return new WorkspaceImportResult(
        workspaceCandidate.getName(), totalNodes, importedNodes, totalEdges, importedEdges);
  }

  private List<LinkDto> extractValidEdges(Workspace workspaceCandidate, List<NodeDto> validNodes) {

    Set<String> validNodeIds = validNodes.stream().map(NodeDto::getId).collect(Collectors.toSet());

    if (workspaceCandidate.getEdges() == null) {
      return Collections.emptyList();
    }

    List<LinkDto> edgesToValidate =
        workspaceCandidate.getEdges().stream()
            .filter(Objects::nonNull)
            .filter(edge -> edge.source() != null && edge.target() != null)
            .filter(edge -> validNodeIds.contains(edge.source()))
            .filter(edge -> validNodeIds.contains(edge.target()))
            .toList();

    List<LinkDto> validEdges = Collections.emptyList();

    if (!edgesToValidate.isEmpty()) {
      List<Map<String, String>> edgeMaps =
          edgesToValidate.stream().map(LinkDto::convertToMap).toList();
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
            .filter(Objects::nonNull)
            .filter(node -> node.getId() != null && node.getNodeType() != null)
            .map(NodeDto::convertToMap)
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
        .filter(Objects::nonNull)
        .filter(node -> node.getId() != null && node.getNodeType() != null)
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
    if (workspace.getNodes() == null && workspace.getEdges() == null) {
      throw new WorkspaceException(
          "Failed to import workspace: No valid nodes and edges found in the workspace file.",
          HttpStatus.BAD_REQUEST);
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
    Optional<Project> project = projectRepository.findByName(projectName);

    if (project.isEmpty()) {
      throw new WorkspaceException(
          "Project with name '" + projectName + "' does not exist", HttpStatus.NOT_FOUND);
    }

    boolean workspaceExists =
        project.get().getWorkspaces().stream()
            .filter(Objects::nonNull)
            .map(Workspace::getName)
            .filter(Objects::nonNull)
            .anyMatch(name -> name.equalsIgnoreCase(workspace.getName()));

    if (workspaceExists) {
      throw new WorkspaceException(
          "Workspace with name '" + workspace.getName() + "' already exists in project '",
          HttpStatus.CONFLICT);
    }
  }
}
