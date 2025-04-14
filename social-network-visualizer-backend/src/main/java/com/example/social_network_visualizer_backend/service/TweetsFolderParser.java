package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDto;
import com.example.social_network_visualizer_backend.dto.MentionDto;
import com.example.social_network_visualizer_backend.dto.ReplyDto;
import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.json.JsonParseException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class TweetsFolderParser {
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;
    private final HashtagRepository hashtagRepository;
    private final TweetRelationService tweetRelationService;

    public void parseDirectory(Path folderPath) {
        List<Path> jsonFiles;

        try (Stream<Path> files = Files.list(folderPath)) {
            jsonFiles = files
                    .filter(path -> path.toString().endsWith(".json"))
                    .collect(Collectors.toList());

        } catch (IOException e) {
            throw new RuntimeException("Error reading directory: " + folderPath, e);
        }

        List<TweetDto> allTweetDtos = loadAllJsonFiles(jsonFiles);
        addAllParentsToTweetsList(allTweetDtos);

        Map<String, TweetDto> tweetsMap = new HashMap<>();

        buildNodes(allTweetDtos, tweetsMap);
        log.info("All nodes added to database");

        createRelationships(tweetsMap);
        log.info("All relations added to database");
    }

    private void addAllParentsToTweetsList(List<TweetDto> tweetsList) {
        List<TweetDto> parents = new ArrayList<>();
        for (TweetDto tweetDto : tweetsList) {
            TweetDto parent = tweetDto.getParent();

            while (parent != null) {
                parents.add(parent);

                parent = parent.getParent();
            }
        }

        tweetsList.addAll(parents);
    }

    private List<TweetDto> loadAllJsonFiles(List<Path> files) {
        List<TweetDto> allTweetDtos = new ArrayList<>();
        for (Path filePath : files) {
            try {
                List<TweetDto> tweetDtosFromFile = readFile(filePath.toFile());
                if (tweetDtosFromFile != null) {
                    allTweetDtos.addAll(tweetDtosFromFile);
                }
            } catch (JsonParseException e) {
                log.error("JSON parsing error for file {}: {}", filePath.getFileName(), e.getMessage());
            } catch (IOException e) {
                log.error("IO error while reading file {}: {}", filePath.getFileName(), e.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error while processing file {}: {}", filePath.getFileName(), e.getMessage());
            }
        }
        return allTweetDtos;
    }

    private List<TweetDto> readFile(File file) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(file, mapper.getTypeFactory().constructCollectionType(List.class, TweetDto.class));
    }

    @Transactional
    public void buildNodes(
            List<TweetDto> tweetDtosList,
            Map<String, TweetDto> tweetsMap
    ) {
        List<Map<String, Object>> authorsData = new ArrayList<>();
        List<Map<String, Object>> hashtagsData = new ArrayList<>();
        List<Map<String, Object>> tweetsData = new ArrayList<>();

        Set<String> uniqAuthors = new HashSet<>();
        Set<String> uniqHashtags = new HashSet<>();

        Map<String, ReplyDto> repliesMap = new HashMap<>();
        Map<String, MentionDto> mentionsMap = new HashMap<>();

        for (TweetDto tweetDto : tweetDtosList) {
            if (tweetsMap.containsKey(tweetDto.getId()) || tweetDto.getAuthor() == null) {
                continue;
            }

            if (!uniqAuthors.contains(tweetDto.getAuthor().getUserName())) {
                Map<String, Object> authorNode = buildAuthorNode(tweetDto.getAuthor());
                authorsData.add(authorNode);
                uniqAuthors.add(tweetDto.getAuthor().getUserName());
            }
            Map<String, Object> tweetNode = buildTweetNode(tweetDto);
            tweetsData.add(tweetNode);
            tweetsMap.put(tweetDto.getId(), tweetDto);

            if (tweetDto.getReplies() != null) {
                for (ReplyDto reply : tweetDto.getReplies()) {
                    repliesMap.put(reply.getUsername(), reply);
                }
            }

            if (tweetDto.getMentions() != null) {
                for (MentionDto mention : tweetDto.getMentions()) {
                    mentionsMap.put(mention.getUserId(), mention);
                }
            }

            if (tweetDto.getHashtags() != null) {
                for (String hashtagName : tweetDto.getHashtags()) {
                    if (!uniqHashtags.contains(hashtagName)) {
                        Map<String, Object> hashtagNode = buildHashtagNode(hashtagName);
                        hashtagsData.add(hashtagNode);
                        uniqHashtags.add(hashtagName);
                    }
                }
            }
        }

        updateAuthorsDataFromReplies(uniqAuthors, repliesMap, authorsData);
        updateAuthorsDataFromMentions(uniqAuthors, mentionsMap, authorsData);

        tweetRepository.createAll(tweetsData);
        authorRepository.createAll(authorsData);
        hashtagRepository.createAll(hashtagsData);
    }

    private void updateAuthorsDataFromReplies(Set<String> uniqAuthors, Map<String, ReplyDto> repliesMap, List<Map<String, Object>> authorsData) {
        for (ReplyDto reply : repliesMap.values()) {
            updateAuthorsData(uniqAuthors, authorsData, reply.getUsername(), reply.getUserId());
        }
    }

    private void updateAuthorsDataFromMentions(Set<String> uniqAuthors, Map<String, MentionDto> mentionsMap, List<Map<String, Object>> authorsData) {
        for (MentionDto mention : mentionsMap.values()) {
            updateAuthorsData(uniqAuthors, authorsData, mention.getUsername(), mention.getUserId());
        }
    }

    private void updateAuthorsData(Set<String> uniqAuthors, List<Map<String, Object>> authorsData, String username, String userId) {
        if (!uniqAuthors.contains(username)) {
            Map<String, Object> map = new HashMap<>();
            map.put("userName", username);
            map.put("foreignId", userId);

            uniqAuthors.add(username);
            authorsData.add(map);
        }
    }

    private Map<String, Object> buildAuthorNode(AuthorDto authorDto) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", authorDto.getId());
        map.put("userName", authorDto.getUserName());
        map.put("displayName", authorDto.getDisplayName());
        map.put("name", authorDto.getName());
        map.put("foreignId", authorDto.getForeignId());
        map.put("bot", authorDto.getBot());
        return map;
    }

    private Map<String, Object> buildTweetNode(TweetDto tweetDto) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", tweetDto.getId());
        map.put("objectCreatedAt", LocalDateTime.ofInstant(tweetDto.getObjectCreatedAt().toInstant(), ZoneId.systemDefault()));
        map.put("publicationDate", LocalDateTime.ofInstant(tweetDto.getPublicationDate().toInstant(), ZoneId.systemDefault()));
        map.put("objectType", tweetDto.getObjectType());
        map.put("language", tweetDto.getLanguage());
        map.put("contentPreview", tweetDto.getContentPreview());
        map.put("content", tweetDto.getContent());
        map.put("twitterId", tweetDto.getTwitterId());
        map.put("url", tweetDto.getUrl());
        map.put("conversationId", tweetDto.getConversationId());
        map.put("links", tweetDto.getLinks());
        map.put("photos", tweetDto.getPhotos());
        map.put("videos", tweetDto.getVideos());
        map.put("repliesCount", tweetDto.getRepliesCount());
        map.put("retweetsCount", tweetDto.getRetweetsCount());
        map.put("likesCount", tweetDto.getLikesCount());
        return map;
    }

    private Map<String, Object> buildHashtagNode(String hashtagStr) {
        Map<String, Object> map = new HashMap<>();
        map.put("hashtag", hashtagStr);
        return map;
    }

    @Transactional
    public void createRelationships(Map<String, TweetDto> tweetsMap) {
        tweetRelationService.createAuthorTweetRelations(tweetsMap);
        tweetRelationService.createTweetMentionsRelations(tweetsMap);
        tweetRelationService.createTweetRepliesRelations(tweetsMap);
        tweetRelationService.createTweetParentRelations(tweetsMap);
        tweetRelationService.createTweetHashtagRelations(tweetsMap);
    }
}
