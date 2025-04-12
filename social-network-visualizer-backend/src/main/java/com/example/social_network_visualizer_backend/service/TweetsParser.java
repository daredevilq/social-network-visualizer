package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDto;
import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.Hashtag;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TweetsParser {
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;
    private final HashtagRepository hashtagRepository;

    public void parseJsonFileFromPath(String filePath) {
        File file = new File(filePath);
        List<TweetDto> objectList = readFile(file);
        if (objectList == null) {
            log.error("Error parsing file!");
            return;
        }

        Map<String, Author> authorsMap = new HashMap<>();
        Map<String, Hashtag> hashtagsMap = new HashMap<>();
        buildMaps(objectList, authorsMap, hashtagsMap);

        List<Tweet> tweetsToSave = createTweets(objectList, authorsMap, hashtagsMap);

        saveTweets(tweetsToSave, new ArrayList<>(authorsMap.values()), new ArrayList<>(hashtagsMap.values()));
    }

    private List<TweetDto> readFile(File file) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(file, mapper.getTypeFactory().constructCollectionType(List.class, TweetDto.class));
        } catch (Exception e) {
            log.error("Failed to parse file: " + e.getMessage());
            return null;
        }
    }

    private void buildMaps(List<TweetDto> objectList, Map<String, Author> authorsMap, Map<String, Hashtag> hashtagsMap) {

        for (TweetDto tweetDto : objectList) {
            AuthorDto authorDto = tweetDto.getAuthor();
            if (authorDto != null && !authorsMap.containsKey(authorDto.getId())) {
                authorsMap.put(authorDto.getId(), Author.builder()
                        .id(authorDto.getId())
                        .userName(authorDto.getUserName())
                        .displayName(authorDto.getDisplayName())
                        .name(authorDto.getName())
                        .foreignId(authorDto.getForeignId())
                        .bot(authorDto.getBot())
                        .tweetList(new ArrayList<>())
                        .build());
            }

            if (tweetDto.getHashtags() != null) {
                for (String hashtag : tweetDto.getHashtags()) {
                    hashtagsMap.putIfAbsent(hashtag, new Hashtag(hashtag, new ArrayList<>()));
                }
            }
        }
    }

    private List<Tweet> createTweets(List<TweetDto> objectList, Map<String, Author> authorsMap,
                                     Map<String, Hashtag> hashtagsMap) {
        List<Tweet> tweetsToSave = new ArrayList<>();
        for (TweetDto tweetDto : objectList) {

            Author author = authorsMap.get(tweetDto.getAuthor().getId());
            Tweet tweet = createTweetFromDto(tweetDto, author, hashtagsMap);
            tweetsToSave.add(tweet);

        }
        return tweetsToSave;
    }

    private Tweet createTweetFromDto(TweetDto tweetDto, Author author,
                                     Map<String, Hashtag> hashtagsMap) {
        Tweet tweet = Tweet.builder()
                .id(tweetDto.getId())
                .objectCreatedAt(tweetDto.getObjectCreatedAt())
                .publicationDate(tweetDto.getPublicationDate())
                .language(tweetDto.getLanguage())
                .contentPreview(tweetDto.getContentPreview())
                .content(tweetDto.getContent())
                .twitterId(tweetDto.getTwitterId())
                .url(tweetDto.getUrl())
                .conversationId(tweetDto.getConversationId())
//                .mentions(tweetDto.getMentions())
//                .replies(tweetDto.getReplies())
                .links(tweetDto.getLinks())
                .photos(tweetDto.getPhotos())
                .videos(tweetDto.getVideos())
                .repliesCount(tweetDto.getRepliesCount())
                .retweetsCount(tweetDto.getRetweetsCount())
                .likesCount(tweetDto.getLikesCount())
                .author(author)
                .hashtags(
                        tweetDto.getHashtags() != null ? tweetDto.getHashtags().stream()
                                .map(hashtagsMap::get)
                                .collect(Collectors.toList()) : new ArrayList<>()
                )
                .build();

        author.addTweet(tweet);

        for (Hashtag hashtag : tweet.getHashtags()) {
            hashtag.addTweet(tweet);
        }
        return tweet;
    }

    private void saveTweets(List<Tweet> tweets, List<Author> authors, List<Hashtag> hashtags) {
        tweetRepository.saveAll(tweets);
        authorRepository.saveAll(authors);
        hashtagRepository.saveAll(hashtags);
        log.info("Save data to database");
    }
}