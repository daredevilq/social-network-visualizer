package com.example.social_network_visualizer_backend.controller;

import com.example.social_network_visualizer_backend.enums.RelationType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.EnumSet;


@RestController
@RequestMapping("/relations")
public class RelationsController {
    @GetMapping
    public ResponseEntity<EnumSet<RelationType>> getAllAvailableRelations() {
        return ResponseEntity.ok(EnumSet.allOf(RelationType.class));
    }
}
