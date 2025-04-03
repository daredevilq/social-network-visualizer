package com.example.social_network_visualizer_backend.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SourceDto {
    private String id;
    private String name;
    private String url;
    private String type;
}
