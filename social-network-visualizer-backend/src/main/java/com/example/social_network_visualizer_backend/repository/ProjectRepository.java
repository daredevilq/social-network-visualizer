package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.project.Project;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface ProjectRepository extends MongoRepository<Project, String> {
  Optional<Project> findByName(String name);

  void deleteByName(String name);

  @Query(
      value = "{ 'name': ?0, 'workspaces.name': { $regex: ?1, $options: 'i' } }",
      fields = "{ 'workspaces.$': 1 }")
  Optional<Project> findWorkspaceByProjectNameAndWorkspaceName(
      String projectName, String workspaceName);
}
