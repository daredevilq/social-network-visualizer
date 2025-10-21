package com.example.social_network_visualizer_backend.dto.request;

import com.example.social_network_visualizer_backend.enums.NodeType;
import com.example.social_network_visualizer_backend.enums.RelationType;
import java.util.Set;

public record GraphQueryRequest(Set<NodeType> nodeTypes, Set<RelationType> relationTypes) {}
