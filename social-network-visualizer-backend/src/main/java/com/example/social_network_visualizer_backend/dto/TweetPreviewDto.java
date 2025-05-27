package com.example.social_network_visualizer_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TweetPreviewDto {
    private String url;
    private String contentPreview;
}
