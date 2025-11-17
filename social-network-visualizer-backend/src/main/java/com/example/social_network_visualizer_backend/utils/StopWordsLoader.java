package com.example.social_network_visualizer_backend.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;

public class StopWordsLoader {
  private static final String FILE_NAME = "stopwords.txt";
  private static final Set<String> STOP_WORDS_CACHE;

  static {
    STOP_WORDS_CACHE = loadStopWords();
  }

  private static Set<String> loadStopWords() {
    try (InputStream inputStream =
        StopWordsLoader.class.getClassLoader().getResourceAsStream(FILE_NAME)) {

      if (inputStream == null) {
        throw new RuntimeException("File not found: " + FILE_NAME);
      }

      try (BufferedReader reader =
          new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
        Set<String> words =
            reader
                .lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .collect(Collectors.toSet());
        return Set.copyOf(words);
      }
    } catch (IOException e) {
      throw new RuntimeException("Stop words loading error", e);
    }
  }

  public static Set<String> getStopWords() {
    return STOP_WORDS_CACHE;
  }
}
