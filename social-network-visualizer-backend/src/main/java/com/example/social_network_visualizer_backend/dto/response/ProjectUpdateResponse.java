package com.example.social_network_visualizer_backend.dto.response;

import java.util.List;

public record ProjectUpdateResponse(
        String message,
        List<String> skippedFiles
) {
}

