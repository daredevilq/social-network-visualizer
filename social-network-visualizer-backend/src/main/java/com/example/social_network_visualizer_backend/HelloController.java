package com.example.social_network_visualizer_backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @Value("${spring.profiles.active:default}")
    String activeProfile;

    @GetMapping("/hello")
    public String getHelloMessage(){
        return "Hello there!! active spring profile:" + activeProfile;
    }

    @GetMapping("/")
    public String getStartMessage(){
        return "This is start message!!!";
    }
}
