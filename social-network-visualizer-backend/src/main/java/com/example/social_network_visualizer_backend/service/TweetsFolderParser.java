package com.example.social_network_visualizer_backend.service;

import com.example.social_network_visualizer_backend.dto.AuthorDto;
import com.example.social_network_visualizer_backend.dto.MentionDto;
import com.example.social_network_visualizer_backend.dto.ReplyDto;
import com.example.social_network_visualizer_backend.dto.TweetDto;
import com.example.social_network_visualizer_backend.model.Author;
import com.example.social_network_visualizer_backend.model.Cashtag;
import com.example.social_network_visualizer_backend.model.Hashtag;
import com.example.social_network_visualizer_backend.model.Tweet;
import com.example.social_network_visualizer_backend.repository.AuthorRepository;
import com.example.social_network_visualizer_backend.repository.CashtagRepository;
import com.example.social_network_visualizer_backend.repository.HashtagRepository;
import com.example.social_network_visualizer_backend.repository.TweetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TweetsFolderParser {
    private final TweetRepository tweetRepository;
    private final AuthorRepository authorRepository;
    private final CashtagRepository cashtagRepository;
    private final HashtagRepository hashtagRepository;

    public void parseDirectory(String folderPath) {
        File folder = new File(folderPath);
        if (!folder.isDirectory()) {
            System.out.println("Not a directory: "+  folderPath);
            return;
        }

        File[] files = folder.listFiles((dir, name) -> name.endsWith(".json"));
        if (files == null || files.length == 0) {
            System.out.println("No .json files found in folder: " + folderPath);
            return;
        }

        List<TweetDto> allTweetDtos = loadAllJsonFiles(files);

        Map<String, Author> authorsMap = new HashMap<>();
        Map<String, Hashtag> hashtagsMap = new HashMap<>();
        Map<String, Cashtag> cashtagsMap = new HashMap<>();
        Map<String, Tweet> tweetsMap = new HashMap<>();

        buildNodes(allTweetDtos, authorsMap, hashtagsMap, cashtagsMap, tweetsMap);

        createRelationships(allTweetDtos, tweetsMap, authorsMap);

        authorRepository.saveAll(authorsMap.values());
        hashtagRepository.saveAll(hashtagsMap.values());
        cashtagRepository.saveAll(cashtagsMap.values());
        tweetRepository.saveAll(tweetsMap.values());

        log.info("All JSON files parsed and saved form folder: {}", folderPath);
    }

    private List<TweetDto> loadAllJsonFiles(File[] files) {
        List<TweetDto> allTweetDtos = new ArrayList<>();
        System.out.println(Arrays.toString(files));
        for (File file : files) {
            try {
                List<TweetDto> tweetDtosFromFile = readFile(file);
                if (tweetDtosFromFile != null) {
                    allTweetDtos.addAll(tweetDtosFromFile);
                }
            } catch (Exception e) {
                log.error("Failed to parse file into TweetDto: {} {}", file.getName(), e.getMessage());
            }
        }
        return allTweetDtos;
    }

    private List<TweetDto> readFile(File file) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(file, mapper.getTypeFactory().constructCollectionType(List.class, TweetDto.class));
    }

    private void buildNodes(
            List<TweetDto> dtos,
            Map<String, Author> authorsMap,
            Map<String, Hashtag> hashtagsMap,
            Map<String, Cashtag> cashtagsMap,
            Map<String, Tweet> tweetsMap
    ) {
        for (TweetDto dto : dtos) {
            if (dto.getAuthor() == null) {
                continue;
            }
            Author author = upsertAuthor(dto.getAuthor(), authorsMap);

            if (tweetsMap.containsKey(dto.getId())) {
                continue;
            }

            Tweet tweet = buildTweetNode(dto, author);

            tweetsMap.put(dto.getId(), tweet);
            author.getTweetList().add(tweet);

            if (dto.getHashtags() != null) {
                for (String hashtagStr : dto.getHashtags()) {
                    Hashtag hashtag = upsertHashtag(hashtagStr, hashtagsMap);
                    tweet.getHashtags().add(hashtag);
                    hashtag.getTweetList().add(tweet);
                }
            }

            if (dto.getCashtags() != null) {
                for (String cashtagStr : dto.getCashtags()) {
                    Cashtag cashtag = upsertCashtag(cashtagStr, cashtagsMap);
                    tweet.getCashtags().add(cashtag);
                    cashtag.getTweetList().add(tweet);
                }
            }
        }
    }

    private Author upsertAuthor(AuthorDto authorDto, Map<String, Author> authorsMap) {
        Author author = authorsMap.get(authorDto.getUserName());
        if (author == null) {
            author = Author.builder()
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
        return author;
    }

    private Tweet buildTweetNode(TweetDto dto, Author author) {
        return Tweet.builder()
                .id(dto.getId())
                .objectType(dto.getObjectType())
                .objectCreatedAt(dto.getObjectCreatedAt())
                .publicationDate(dto.getPublicationDate())
                .language(dto.getLanguage())
                .contentPreview(dto.getContentPreview())
                .content(dto.getContent())
                .twitterId(dto.getTwitterId())
                .url(dto.getUrl())
                .conversationId(dto.getConversationId())
                .links(dto.getLinks())
                .photos(dto.getPhotos())
                .videos(dto.getVideos())
                .repliesCount(dto.getRepliesCount())
                .retweetsCount(dto.getRetweetsCount())
                .likesCount(dto.getLikesCount())
                .author(author)
                .hashtags(new ArrayList<>())
                .cashtags(new ArrayList<>())
                .build();
    }

    private Hashtag upsertHashtag(String hashtagStr, Map<String, Hashtag> hashtagsMap) {
        Hashtag hashtag = hashtagsMap.get(hashtagStr);
        if (hashtag == null) {
            hashtag = Hashtag.builder()
                    .hashtag(hashtagStr)
                    .tweetList(new ArrayList<>())
                    .build();
            hashtagsMap.put(hashtagStr, hashtag);
        }
        return hashtag;
    }

    private Cashtag upsertCashtag(String cashtagStr, Map<String, Cashtag> cashtagsMap) {
        Cashtag cashtag = cashtagsMap.get(cashtagStr);
        if (cashtag == null) {
            cashtag = Cashtag.builder()
                    .cashtag(cashtagStr)
                    .tweetList(new ArrayList<>())
                    .build();
            cashtagsMap.put(cashtagStr, cashtag);
        }
        return cashtag;
    }

    private void createRelationships(
            List<TweetDto> dtos,
            Map<String, Tweet> tweetsMap,
            Map<String, Author> authorsMap
    ) {
        for (TweetDto dto : dtos) {
            Tweet childTweet = tweetsMap.get(dto.getId());
            if (childTweet == null) {
                continue;
            }

            if (dto.getParent() != null) {
                TweetDto parentDto = dto.getParent();
                Tweet parentTweet = tweetsMap.get(parentDto.getId());
                if (parentTweet == null) {
                    parentTweet = createParentTweet(parentDto, authorsMap);
                    tweetsMap.put(parentDto.getId(), parentTweet);
                }
                childTweet.setParent(parentTweet);
            }

            if (dto.getMentions() != null && !dto.getMentions().isEmpty()) {
                List<Author> mentionAuthors = createMentionAuthors(dto.getMentions(), authorsMap);
                childTweet.setMentions(mentionAuthors);
            }

            if (dto.getReplies() != null && !dto.getReplies().isEmpty()) {
                List<Author> replyAuthors = createReplyAuthors(dto.getReplies(), authorsMap);
                childTweet.setReplies(replyAuthors);
            }
        }
    }

    private Tweet createParentTweet(TweetDto parentDto, Map<String, Author> authorsMap) {
        Author parentAuthor = null;
        if (parentDto.getAuthor() != null) {
            parentAuthor = upsertAuthor(parentDto.getAuthor(), authorsMap);
        }

        Tweet newParent = Tweet.builder()
                .id(parentDto.getId())
                .objectType(parentDto.getObjectType())
                .objectCreatedAt(parentDto.getObjectCreatedAt())
                .publicationDate(parentDto.getPublicationDate())
                .language(parentDto.getLanguage())
                .contentPreview(parentDto.getContentPreview())
                .content(parentDto.getContent())
                .twitterId(parentDto.getTwitterId())
                .url(parentDto.getUrl())
                .conversationId(parentDto.getConversationId())
                .links(parentDto.getLinks())
                .photos(parentDto.getPhotos())
                .videos(parentDto.getVideos())
                .repliesCount(parentDto.getRepliesCount())
                .retweetsCount(parentDto.getRetweetsCount())
                .likesCount(parentDto.getLikesCount())
                .author(parentAuthor)
                .hashtags(new ArrayList<>())
                .cashtags(new ArrayList<>())
                .build();

        if (parentAuthor != null) {
            parentAuthor.getTweetList().add(newParent);
        }
        return newParent;
    }

    private List<Author> createMentionAuthors(List<MentionDto> mentions, Map<String, Author> authorsMap) {
        List<Author> mentionAuthors = new ArrayList<>();
        for (MentionDto mention : mentions) {
            if (mention.getUserName() == null) continue;
            Author mentionAuthor = authorsMap.get(mention.getUserName());
            if (mentionAuthor == null) {
                mentionAuthor = Author.builder()
                        .id(mention.getUserId())
                        .userName(mention.getUserName())
                        .tweetList(new ArrayList<>())
                        .build();
                authorsMap.put(mention.getUserName(), mentionAuthor);
            }
            mentionAuthors.add(mentionAuthor);
        }
        return mentionAuthors;
    }

    private List<Author> createReplyAuthors(List<ReplyDto> replies, Map<String, Author> authorsMap) {
        List<Author> replyAuthors = new ArrayList<>();
        for (ReplyDto reply : replies) {
            if (reply.getUserName() == null) continue;
            Author replyAuthor = authorsMap.get(reply.getUserName());
            if (replyAuthor == null) {
                replyAuthor = Author.builder()
                        .id(reply.getUserId())
                        .userName(reply.getUserName())
                        .tweetList(new ArrayList<>())
                        .build();
                authorsMap.put(reply.getUserName(), replyAuthor);
            }
            replyAuthors.add(replyAuthor);
        }
        return replyAuthors;
    }
}
