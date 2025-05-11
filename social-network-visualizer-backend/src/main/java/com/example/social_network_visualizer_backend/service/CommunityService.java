package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.CommunitySummary;
import com.example.social_network_visualizer_backend.repository.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommunityService {
    private final CommunityRepository communityRepository;

    public List<CommunitySummary> listAllCommunities() {
        return communityRepository.findAllCommunitySummaries();
    }

    public List<CommunitySummary> listCommunities(int page, int size) {
        return communityRepository.findPagedCommunitySummaries(page, size);
    }

}
