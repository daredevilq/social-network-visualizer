package com.example.social_network_visualizer_backend.model.project;

import lombok.Builder;
import lombok.Data;
import org.bson.types.Binary;

@Data
@Builder
public class ProjectFile {
    private String filename;
    private Binary data;
}