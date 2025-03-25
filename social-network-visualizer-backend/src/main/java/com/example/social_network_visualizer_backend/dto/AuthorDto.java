package com.example.social_network_visualizer_backend.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthorDto {
    private String id;
    private String userName;
    private String displayName;
    private String name;
    private String foreignId;
    private OriginDto origin;
    private Boolean bot;
}
