package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.CommunitySummary;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {
    private final AuthorRepository authorRepository;

    public List<CommunitySummary> listAllCommunities() {
        List<Author> authors = authorRepository.findAllWithCommunity();

        Map<Integer, List<Author>> groupedByCommunity = authors.stream()
                .collect(Collectors.groupingBy(author -> author.getCommunity()));

        List<CommunitySummary> summaries = new ArrayList<>();

        for (Map.Entry<Integer, List<Author>> entry : groupedByCommunity.entrySet()) {
            int communityId = entry.getKey();
            List<Author> members = entry.getValue();

            Author topAuthor = members.stream()
                    .max(Comparator.comparingDouble(Author::getPagerank))
                    .orElse(null);


            CommunitySummary summary = new CommunitySummary(
                    communityId,
                    members.size(),
                    topAuthor != null ? topAuthor.getUserName() : "unknown",
                    topAuthor != null
                            ? BigDecimal.valueOf(topAuthor.getPagerank()).setScale(2, RoundingMode.HALF_UP).doubleValue()
                            : 0.0
            );

            summaries.add(summary);
        }

        return summaries;
    }
}
