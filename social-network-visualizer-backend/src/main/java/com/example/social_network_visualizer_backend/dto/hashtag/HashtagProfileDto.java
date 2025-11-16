package com.example.social_network_visualizer_backend.dto.hashtag;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HashtagProfileDto {
  private String name;
  private Long totalUsage;
  private Long uniqueUsers;
  private Long totalLikes;
  private Long totalRetweets;
  private LocalDateTime firstUsed;
  private LocalDateTime lastUsed;
  private Long totalReplies;
  private Long distinctLanguages;
}
