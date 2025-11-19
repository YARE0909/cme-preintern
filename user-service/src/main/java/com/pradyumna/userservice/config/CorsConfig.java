package com.pradyumna.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 💥 ALLOW ALL ORIGINS
        config.setAllowedOriginPatterns(List.of("*"));

        // 💥 ALLOW ALL METHODS
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 💥 ALLOW ALL HEADERS (must include Authorization)
        config.setAllowedHeaders(List.of("*"));

        // Allow cookies / Authorization header
        config.setAllowCredentials(true);

        // Expose Authorization header if needed
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
