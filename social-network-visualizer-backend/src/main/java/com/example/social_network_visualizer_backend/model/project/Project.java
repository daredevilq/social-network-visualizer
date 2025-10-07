package com.example.social_network_visualizer_backend.model.project;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "projects")
@Data
public class Project {
    @Id
    private String id;
    private String name;
    private List<ProjectFile> files;
    private List<Workspace> workspaces;
}