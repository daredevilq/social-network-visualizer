package com.example.social_network_visualizer_backend.model.project;

import lombok.Data;
import java.util.List;

@Data
public class Workspace {
    private String name;
    private List<Object> nodes;
    private List<Object> edges;
}

