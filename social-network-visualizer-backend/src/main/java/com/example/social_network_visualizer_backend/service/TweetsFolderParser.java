package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDto;
import com.example.social_network_visualizer_backend.dto.MentionDto;
import com.example.social_network_visualizer_backend.dto.ReplyDto;
import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.Hashtag;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.json.JsonParseException;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class TweetsFolderParser {
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;
    private final HashtagRepository hashtagRepository;

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

        Map<String, Author> authorsMap = new HashMap<>();
        Map<String, Hashtag> hashtagsMap = new HashMap<>();
        Map<String, Tweet> tweetsMap = new HashMap<>();

        buildNodes(allTweetDtos, authorsMap, hashtagsMap, tweetsMap);

        createRelationships(allTweetDtos, tweetsMap, authorsMap, hashtagsMap);

        tweetRepository.saveAll(tweetsMap.values());
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

    private void buildNodes(
            List<TweetDto> tweetDtosList,
            Map<String, Author> authorsMap,
            Map<String, Hashtag> hashtagsMap,
            Map<String, Tweet> tweetsMap
    ) {
        Map<String, ReplyDto> repliesMap = new HashMap<>();
        Map<String, MentionDto> mentionsMap = new HashMap<>();

        for (TweetDto tweetDto : tweetDtosList) {
            if (tweetDto.getAuthor() == null || tweetsMap.containsKey(tweetDto.getId())) {
                continue;
            }

            Author author = updateAuthorsMap(tweetDto.getAuthor(), authorsMap);
            Tweet tweet = buildTweetNode(tweetDto, author);

            tweetsMap.put(tweetDto.getId(), tweet);
            author.getTweetList().add(tweet);

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
                    updateHashtagsMap(hashtagName, hashtagsMap);
                }
            }
        }

        updateAuthorsMapFromReplies(authorsMap, repliesMap);
        updateAuthorsMapFromMentions(authorsMap, mentionsMap);
    }

    private static void updateAuthorsMapFromReplies(Map<String, Author> authorsMap, Map<String, ReplyDto> repliesMap) {
        for (ReplyDto reply : repliesMap.values()) {
            if (!authorsMap.containsKey(reply.getUsername())) {
                Author author = Author.builder()
                        .userName(reply.getUsername())
                        .foreignId(reply.getUserId())
                        .build();

                authorsMap.put(reply.getUsername(), author);
            }
        }
    }

    private void updateAuthorsMapFromMentions(Map<String, Author> authorsMap, Map<String, MentionDto> mentionsMap) {
        for (MentionDto mention : mentionsMap.values()) {
            if (!authorsMap.containsKey(mention.getUsername())) {
                Author author = Author.builder()
                        .userName(mention.getUsername())
                        .foreignId(mention.getUserId())
                        .build();

                authorsMap.put(mention.getUsername(), author);
            }
        }
    }

    private Author updateAuthorsMap(AuthorDto authorDto, Map<String, Author> authorsMap) {
        if (!authorsMap.containsKey(authorDto.getUserName())) {
            Author author = Author.builder()
                    .id(authorDto.getId())
                    .userName(authorDto.getUserName())
                    .displayName(authorDto.getDisplayName())
                    .name(authorDto.getName())
                    .foreignId(authorDto.getForeignId())
                    .bot(authorDto.getBot())
                    .tweetList(new ArrayList<>())
                    .build();

            authorsMap.put(authorDto.getUserName(), author);
        }
        return authorsMap.get(authorDto.getUserName());
    }

    private Tweet buildTweetNode(TweetDto tweetDto, Author author) {
        return Tweet.builder()
                .id(tweetDto.getId())
                .objectType(tweetDto.getObjectType())
                .objectCreatedAt(tweetDto.getObjectCreatedAt())
                .publicationDate(tweetDto.getPublicationDate())
                .language(tweetDto.getLanguage())
                .contentPreview(tweetDto.getContentPreview())
                .content(tweetDto.getContent())
                .twitterId(tweetDto.getTwitterId())
                .url(tweetDto.getUrl())
                .conversationId(tweetDto.getConversationId())
                .links(tweetDto.getLinks())
                .photos(tweetDto.getPhotos())
                .videos(tweetDto.getVideos())
                .repliesCount(tweetDto.getRepliesCount())
                .retweetsCount(tweetDto.getRetweetsCount())
                .likesCount(tweetDto.getLikesCount())
                .author(author)
                .build();
    }

    private void updateHashtagsMap(String hashtagStr, Map<String, Hashtag> hashtagsMap) {
        if (!hashtagsMap.containsKey(hashtagStr)) {
            Hashtag hashtag = Hashtag.builder()
                    .hashtag(hashtagStr)
                    .tweetList(new ArrayList<>())
                    .build();

            hashtagsMap.put(hashtagStr, hashtag);
        }
    }

    private void createRelationships(
            List<TweetDto> tweetDtoList,
            Map<String, Tweet> tweetsMap,
            Map<String, Author> authorsMap,
            Map<String, Hashtag> hashtagsMap
    ) {
        for (TweetDto tweetDto : tweetDtoList) {
            Tweet tweet = tweetsMap.get(tweetDto.getId());

            if (tweetDto.getParent() != null) {
                TweetDto parentDto = tweetDto.getParent();
                Tweet parentTweet = tweetsMap.get(parentDto.getId());
                tweet.setParent(parentTweet);
            }

            assignHashtags(hashtagsMap, tweetDto, tweet);
            assignMentions(authorsMap, tweetDto, tweet);
            assignReplies(authorsMap, tweetDto, tweet);
        }
    }

    private static void assignHashtags(Map<String, Hashtag> hashtagsMap, TweetDto tweetDto, Tweet tweet) {
        List<Hashtag> tweetHashtags = new ArrayList<>();
        if (tweetDto.getHashtags() != null) {
            for (String hashtagStr : tweetDto.getHashtags()) {
                Hashtag hashtag = hashtagsMap.get(hashtagStr);

                tweetHashtags.add(hashtag);
            }
        }
        tweet.setHashtags(tweetHashtags);
    }

    private static void assignMentions(Map<String, Author> authorsMap, TweetDto tweetDto, Tweet tweet) {
        List<Author> tweetMentions = new ArrayList<>();
        if (tweetDto.getReplies() != null) {
            for (MentionDto mention : tweetDto.getMentions()) {
                if (authorsMap.containsKey(mention.getUsername()))
                    tweetMentions.add(authorsMap.get(mention.getUsername()));
            }
        }
        tweet.setMentions(tweetMentions);
    }

    private static void assignReplies(Map<String, Author> authorsMap, TweetDto tweetDto, Tweet tweet) {
        List<Author> tweetReplies = new ArrayList<>();
        if (tweetDto.getMentions() != null) {
            for (ReplyDto reply : tweetDto.getReplies()) {
                if (authorsMap.containsKey(reply.getUsername()))
                    tweetReplies.add(authorsMap.get(reply.getUsername()));
            }
        }
        tweet.setReplies(tweetReplies);
    }
}
