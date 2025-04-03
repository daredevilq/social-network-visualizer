package com.example.social_network_visualizer_backend.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OriginDto {
    private String name;
    private String type;
}
