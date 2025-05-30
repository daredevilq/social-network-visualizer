package com.example.social_network_visualizer_backend.dto;

import com.example.social_network_visualizer_backend.serializer.DateDeserializer;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TweetDto {

    @NotNull
    private String id;

    private String objectType;

    @NotNull
    @JsonDeserialize(using = DateDeserializer.class)
    private Date objectCreatedAt;

    @NotNull
    @JsonDeserialize(using = DateDeserializer.class)
    private Date publicationDate;

    @NotNull
    private AuthorDto author;

    private SourceDto source;

    private String language;

    private String contentPreview;

    @NotNull
    private String content;

    private String twitterId;

    private String url;

    private List<String> hashtags;

    private List<MentionDto> mentions;

    private List<String> links;

    private List<String> photos;

    private List<String> videos;

    private List<ReplyDto> replies;

    private long repliesCount;

    private long retweetsCount;

    private long likesCount;

    private String conversationId;

    private TweetDto parent;
}