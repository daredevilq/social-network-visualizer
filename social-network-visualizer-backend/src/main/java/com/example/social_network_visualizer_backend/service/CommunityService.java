package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.dto.community.CommunityOverview;
import com.example.social_network_visualizer_backend.dto.community.CommunitySummary;
import com.example.social_network_visualizer_backend.dto.community.SizeCount;
import com.example.social_network_visualizer_backend.model.Author;
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

    public List<Integer> getTopCommunityIds(int limit) {
        return communityRepository.findTopCommunityIds(limit);
    }

    public CommunityOverview getCommunityOverview(){
        return communityRepository.getCommunityOverview();
    }

    public CommunitySummary getCommunitySummary(int communityId){
        return communityRepository.findCommunitySummaryById(communityId);
    }

    public List<Author> getAuthorsWithCommunityId(int communityId){
        return communityRepository.findAuthorsByCommunityId(communityId);
    }

    public List<ActivityHeatmap> getCommunityActivityHeatmap(int communityId){
        return communityRepository.getCommunityActivityHeatMap(communityId);
    }


}
