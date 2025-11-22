package com.example.social_network_visualizer_backend.utils;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public class WordOccurrenceCounter {
  public static Map<String, Long> countOccurrences(List<String> tweetsContent, int wordsLimit) {
    Set<String> STOP_WORDS = StopWordsLoader.getStopWords();

    return tweetsContent.stream()
        .flatMap(tweet -> Arrays.stream(tweet.toLowerCase().split("\\P{L}+")))
        .filter(word -> !word.isEmpty() && !STOP_WORDS.contains(word) && word.length() >= 2)
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
        .entrySet()
        .stream()
        .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
        .limit(wordsLimit)
        .collect(
            Collectors.toMap(
                Map.Entry::getKey, Map.Entry::getValue, (v1, v2) -> v1, LinkedHashMap::new));
  }
}
