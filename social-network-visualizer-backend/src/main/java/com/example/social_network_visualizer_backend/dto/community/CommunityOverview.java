package com.example.social_network_visualizer_backend.dto.community;

import java.util.List;

public record CommunityOverview(
        double avgHashtagsPerAuthor,
        long totalTweets,
        int totalCommunities,
        int minSize,
        int maxSize,
        double avgSize,
        double p10, double p25, double median, double p75, double p90,
        List<SizeCount> sizeHistogram,
        double avgTweetsPerAuthor,
        long uniqueHashtags
) {}
