package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDto;
import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.Cashtag;
import com.example.social_network_visualizer_backend.model.Hashtag;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.CashtagRepository;
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
    private final CashtagRepository cashtagRepository;
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
        Map<String, Cashtag> cashtagsMap = new HashMap<>();
        buildMaps(objectList, authorsMap, hashtagsMap, cashtagsMap);

        List<Tweet> tweetsToSave = createTweets(objectList, authorsMap, hashtagsMap, cashtagsMap);

        saveTweets(tweetsToSave, new ArrayList<>(authorsMap.values()), new ArrayList<>(hashtagsMap.values()), new ArrayList<>(cashtagsMap.values()));
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

    private void buildMaps(List<TweetDto> objectList, Map<String, Author> authorsMap, Map<String, Hashtag> hashtagsMap, Map<String, Cashtag> cashtagsMap) {

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

            if (tweetDto.getCashtags() != null) {
                for (String cashtag : tweetDto.getCashtags()) {
                    cashtagsMap.putIfAbsent(cashtag, new Cashtag(cashtag, new ArrayList<>()));
                }
            }
        }
    }

    private List<Tweet> createTweets(List<TweetDto> objectList, Map<String, Author> authorsMap,
                                     Map<String, Hashtag> hashtagsMap, Map<String, Cashtag> cashtagsMap) {
        List<Tweet> tweetsToSave = new ArrayList<>();
        for (TweetDto tweetDto : objectList) {

            Author author = authorsMap.get(tweetDto.getAuthor().getId());
            Tweet tweet = createTweetFromDto(tweetDto, author, hashtagsMap, cashtagsMap);
            tweetsToSave.add(tweet);

        }
        return tweetsToSave;
    }

    private Tweet createTweetFromDto(TweetDto tweetDto, Author author,
                                     Map<String, Hashtag> hashtagsMap, Map<String, Cashtag> cashtagsMap) {
        Tweet tweet = Tweet.builder()
                .id(tweetDto.getId())
                .objectCreatedAt(tweetDto.getObjectCreatedAt())
                .publicationDate(tweetDto.getPublicationDate())
                .objectType(tweetDto.getObjectType())
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
                .cashtags(
                        tweetDto.getCashtags() != null ? tweetDto.getCashtags().stream()
                                .map(cashtagsMap::get)
                                .collect(Collectors.toList()) : new ArrayList<>()
                )
                .build();

        author.addTweet(tweet);

        for (Hashtag hashtag : tweet.getHashtags()) {
            hashtag.addTweet(tweet);
        }

        for (Cashtag cashtag : tweet.getCashtags()) {
            cashtag.addTweet(tweet);
        }

        return tweet;
    }

    private void saveTweets(List<Tweet> tweets, List<Author> authors, List<Hashtag> hashtags, List<Cashtag> cashtags) {
        tweetRepository.saveAll(tweets);
        authorRepository.saveAll(authors);
        hashtagRepository.saveAll(hashtags);
        cashtagRepository.saveAll(cashtags);
        log.info("Save data to database");
    }
}