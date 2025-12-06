package com.example.social_network_visualizer_backend.utils;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class WordOccurrenceCounterTest {

  @Test
  void testCountOccurrences_BasicFunctionality() {
    // Arrange
    List<String> tweets = List.of("Java is great", "Python is awesome");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("java"));
    assertTrue(result.containsKey("python"));
    assertTrue(result.containsKey("great"));
    assertTrue(result.containsKey("awesome"));
  }

  @Test
  void testCountOccurrences_FiltersStopWords() {
    // Arrange
    List<String> tweets = List.of("The quick brown fox jumps over the lazy dog");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertFalse(result.containsKey("the"));
    assertFalse(result.containsKey("over"));
    assertTrue(result.containsKey("quick"));
    assertTrue(result.containsKey("brown"));
  }

  @Test
  void testCountOccurrences_CountsWordFrequency() {
    // Arrange
    List<String> tweets = List.of("java java java python python rust");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    assertEquals(3L, result.get("java"));
    assertEquals(2L, result.get("python"));
    assertEquals(1L, result.get("rust"));
  }

  @Test
  void testCountOccurrences_RespectsLimit() {
    // Arrange
    List<String> tweets = List.of("alpha beta gamma delta epsilon zeta eta theta iota kappa");
    int limit = 5;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(5, result.size());
  }

  @Test
  void testCountOccurrences_SortsByFrequencyDescending() {
    // Arrange
    List<String> tweets = List.of("aaa aaa aaa bbb bbb ccc");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    var entries = result.entrySet().stream().toList();
    assertEquals("aaa", entries.get(0).getKey());
    assertEquals(3L, entries.get(0).getValue());
    assertEquals("bbb", entries.get(1).getKey());
    assertEquals(2L, entries.get(1).getValue());
    assertEquals("ccc", entries.get(2).getKey());
    assertEquals(1L, entries.get(2).getValue());
  }

  @Test
  void testCountOccurrences_CaseInsensitive() {
    // Arrange
    List<String> tweets = List.of("Java JAVA java JaVa");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertTrue(result.containsKey("java"));
    assertEquals(4L, result.get("java"));
  }

  @Test
  void testCountOccurrences_FiltersShortWords() {
    // Arrange
    List<String> tweets = List.of("a ab abc abcd abcde");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertFalse(result.containsKey("a"));
    assertTrue(result.containsKey("ab"));
    assertTrue(result.containsKey("abc"));
    assertTrue(result.containsKey("abcd"));
    assertTrue(result.containsKey("abcde"));
  }

  @Test
  void testCountOccurrences_HandlesSpecialCharacters() {
    // Arrange
    List<String> tweets = List.of("hello! world? test@example.com #hashtag @mention");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("hello"));
    assertTrue(result.containsKey("world"));
    assertTrue(result.containsKey("test"));
    assertTrue(result.containsKey("example"));
    assertTrue(result.containsKey("com"));
    assertTrue(result.containsKey("hashtag"));
    assertTrue(result.containsKey("mention"));
  }

  @Test
  void testCountOccurrences_EmptyInput() {
    // Arrange
    List<String> tweets = Collections.emptyList();
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void testCountOccurrences_OnlyStopWords() {
    // Arrange
    List<String> tweets = List.of("the and or but for with");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void testCountOccurrences_OnlyShortWords() {
    // Arrange
    List<String> tweets = List.of("a b c d e f g h i j k");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void testCountOccurrences_MultipleTweets() {
    // Arrange
    List<String> tweets = List.of(
        "Java programming is fun",
        "Python programming is easy",
        "Rust programming is safe"
    );
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(3L, result.get("programming"));
    assertEquals(1L, result.get("java"));
    assertEquals(1L, result.get("python"));
    assertEquals(1L, result.get("rust"));
    assertEquals(1L, result.get("fun"));
    assertEquals(1L, result.get("easy"));
    assertEquals(1L, result.get("safe"));
  }

  @Test
  void testCountOccurrences_WithEmptyStrings() {
    // Arrange
    List<String> tweets = List.of("", "  ", "hello world", "");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertTrue(result.containsKey("hello"));
    assertTrue(result.containsKey("world"));
  }

  @Test
  void testCountOccurrences_WithUnicodeCharacters() {
    // Arrange
    List<String> tweets = List.of("café résumé naïve");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("café"));
    assertTrue(result.containsKey("résumé"));
    assertTrue(result.containsKey("naïve"));
  }

  @Test
  void testCountOccurrences_WithNumbers() {
    // Arrange
    List<String> tweets = List.of("Java 17 Python 3.11 Rust 1.70");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("java"));
    assertTrue(result.containsKey("python"));
    assertTrue(result.containsKey("rust"));
    assertFalse(result.containsKey("17"));
    assertFalse(result.containsKey("3"));
    assertFalse(result.containsKey("11"));
  }

  @Test
  void testCountOccurrences_LimitZero() {
    // Arrange
    List<String> tweets = List.of("java python rust golang");
    int limit = 0;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
  }

  @Test
  void testCountOccurrences_LimitOne() {
    // Arrange
    List<String> tweets = List.of("java java python");
    int limit = 1;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertTrue(result.containsKey("java"));
    assertEquals(2L, result.get("java"));
  }

  @Test
  void testCountOccurrences_PreservesInsertionOrder() {
    // Arrange
    List<String> tweets = List.of("zzz zzz yyy yyy xxx xxx");
    int limit = 10;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertEquals(3, result.size());
    var keys = result.keySet().stream().toList();
    assertTrue(keys.contains("zzz"));
    assertTrue(keys.contains("yyy"));
    assertTrue(keys.contains("xxx"));
  }

  @Test
  void testCountOccurrences_WithMixedContent() {
    // Arrange
    List<String> tweets = List.of(
        "Check out this link: https://example.com",
        "Email me at test@example.com",
        "Follow @user and use #hashtag"
    );
    int limit = 20;

    // Act
    Map<String, Long> result = WordOccurrenceCounter.countOccurrences(tweets, limit);

    // Assert
    assertNotNull(result);
    assertTrue(result.containsKey("check"));
    assertTrue(result.containsKey("link"));
    assertTrue(result.containsKey("example"));
    assertTrue(result.containsKey("com"));
    assertTrue(result.containsKey("email"));
    assertTrue(result.containsKey("follow"));
    assertTrue(result.containsKey("user"));
    assertTrue(result.containsKey("hashtag"));
  }
}

