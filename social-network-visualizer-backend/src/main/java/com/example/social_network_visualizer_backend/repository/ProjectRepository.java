package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.model.project.Project;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProjectRepository extends MongoRepository<Project, String> {
  Optional<Project> findByName(String name);

  void deleteByName(String name);
}
