package com.example.social_network_visualizer_backend;

//import com.example.social_network_visualizer_backend.service.TweetService;
import com.example.social_network_visualizer_backend.service.TweetsParser;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.io.File;

@SpringBootApplication
public class SocialNetworkVisualizerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SocialNetworkVisualizerBackendApplication.class, args);

	}

	@Bean
	CommandLineRunner run(TweetsParser tweetsParser) {
		return args -> {
			tweetsParser.parseJsonFile(new File("./src/main/resources/output.json"));
		};
	}
}
