package com.handmade.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String avatarLocation;

    public StaticResourceConfig(
            @Value("${app.upload.avatar-dir:uploads/avatars}") String avatarDirectory
    ) {
        String location = Path.of(avatarDirectory)
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        this.avatarLocation = location.endsWith("/") ? location : location + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(avatarLocation);
    }
}
