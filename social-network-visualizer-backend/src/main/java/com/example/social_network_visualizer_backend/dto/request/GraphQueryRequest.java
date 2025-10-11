package com.example.social_network_visualizer_backend.dto.request;

import com.example.social_network_visualizer_backend.enums.RelationType;

import java.util.Set;

// it can be extended
public record GraphQueryRequest(String projectName, Set<RelationType> relationTypes, Integer communityId) {}
