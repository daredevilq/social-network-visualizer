package com.example.social_network_visualizer_backend.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class TweetDto {
    private String id;
    private String objectType;
    private Date objectCreatedAt;
    private Date publicationDate;
    private AuthorDto author;
    private SourceDto source;
    private String language;
    private String contentPreview;
    private String content;
    private String twitterId;
    private String url;
    private List<String> hashtags;
    private List<String> cashtags;
    private List<Object> mentions;
    private List<String> links;
    private List<String> photos;
    private List<String> videos;
    private List<Object> replies;
    private long repliesCount;
    private long retweetsCount;
    private long likesCount;
    private String conversationId;
    private Object parent;
}