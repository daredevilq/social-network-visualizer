package com.example.social_network_visualizer_backend.serializer;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class DateDeserializerTest {

  private DateDeserializer deserializer;
  private JsonParser jsonParser;
  private DeserializationContext context;

  @BeforeEach
  void setUp() {
    deserializer = new DateDeserializer();
    jsonParser = Mockito.mock(JsonParser.class);
    context = Mockito.mock(DeserializationContext.class);
  }

  @Test
  void testDeserialize_WithMilliseconds() throws Exception {
    // Arrange
    String dateString = "2023-11-15T14:30:45.123Z";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    Date expectedDate = expectedFormat.parse(dateString);

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_WithoutMilliseconds() throws Exception {
    // Arrange
    String dateString = "2023-11-15T14:30:45Z";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
    Date expectedDate = expectedFormat.parse(dateString);

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_WithMillisecondsZeroPadded() throws Exception {
    // Arrange
    String dateString = "2023-01-05T09:05:05.001Z";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    Date expectedDate = expectedFormat.parse(dateString);

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_WithWhitespace() throws Exception {
    // Arrange
    String dateString = "  2023-11-15T14:30:45.123Z  ";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    Date expectedDate = expectedFormat.parse(dateString.trim());

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_InvalidFormat_ThrowsException() throws Exception {
    // Arrange
    String invalidDateString = "2023-11-15 14:30:45";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(invalidDateString);

    // Act & Assert
    IOException exception =
        assertThrows(IOException.class, () -> deserializer.deserialize(jsonParser, context));
    assertTrue(exception.getMessage().contains("Invalid date format"));
  }

  @Test
  void testDeserialize_InvalidFormatWithoutZ_ThrowsException() throws Exception {
    // Arrange
    String invalidDateString = "2023-11-15T14:30:45";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(invalidDateString);

    // Act & Assert
    IOException exception =
        assertThrows(IOException.class, () -> deserializer.deserialize(jsonParser, context));
    assertTrue(exception.getMessage().contains("Invalid date format"));
  }

  @Test
  void testDeserialize_NonStringToken_ThrowsException() throws Exception {
    // Arrange
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_NUMBER_INT);

    // Act & Assert
    IOException exception =
        assertThrows(IOException.class, () -> deserializer.deserialize(jsonParser, context));
    assertEquals("Expected date string", exception.getMessage());
  }

  @Test
  void testDeserialize_NullToken_ThrowsException() throws Exception {
    // Arrange
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_NULL);

    // Act & Assert
    IOException exception =
        assertThrows(IOException.class, () -> deserializer.deserialize(jsonParser, context));
    assertEquals("Expected date string", exception.getMessage());
  }

  @Test
  void testDeserialize_EmptyString_ThrowsException() throws Exception {
    // Arrange
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn("");

    // Act & Assert
    IOException exception =
        assertThrows(IOException.class, () -> deserializer.deserialize(jsonParser, context));
    assertTrue(exception.getMessage().contains("Invalid date format"));
  }

  @Test
  void testDeserialize_MidnightTime() throws Exception {
    // Arrange
    String dateString = "2023-11-15T00:00:00.000Z";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    Date expectedDate = expectedFormat.parse(dateString);

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_EndOfDayTime() throws Exception {
    // Arrange
    String dateString = "2023-11-15T23:59:59.999Z";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    Date expectedDate = expectedFormat.parse(dateString);

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_LeapYearDate() throws Exception {
    // Arrange
    String dateString = "2024-02-29T12:00:00.000Z";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(dateString);
    SimpleDateFormat expectedFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    Date expectedDate = expectedFormat.parse(dateString);

    // Act
    Date result = deserializer.deserialize(jsonParser, context);

    // Assert
    assertNotNull(result);
    assertEquals(expectedDate, result);
  }

  @Test
  void testDeserialize_CompleteMalformedString_ThrowsException() throws Exception {
    // Arrange
    String invalidDateString = "not-a-date-at-all";
    Mockito.when(jsonParser.currentToken()).thenReturn(JsonToken.VALUE_STRING);
    Mockito.when(jsonParser.getText()).thenReturn(invalidDateString);

    // Act & Assert
    IOException exception =
        assertThrows(IOException.class, () -> deserializer.deserialize(jsonParser, context));
    assertTrue(exception.getMessage().contains("Invalid date format"));
  }
}
