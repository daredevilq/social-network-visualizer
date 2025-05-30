package com.example.social_network_visualizer_backend.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateDeserializer extends JsonDeserializer<Date> {
    private static final SimpleDateFormat formatterWithMillis = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    private static final SimpleDateFormat formatterWithoutMillis = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() != JsonToken.VALUE_STRING) {
            throw new IOException("Expected date string");
        }
        String dateStr = p.getText().trim();

        try {
            return formatterWithMillis.parse(dateStr);
        } catch (ParseException e1) {
            try {
                return formatterWithoutMillis.parse(dateStr);
            } catch (ParseException e2) {
                throw new IOException("Invalid date format, expected yyyy-MM-dd'T'HH:mm:ss[.SSS]'Z'", e2);
            }
        }
    }
}
