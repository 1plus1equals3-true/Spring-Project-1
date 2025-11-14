package com.youngjin.mcl_project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {


    @Value("${file.upload.base-dir}")
    private String BASE_DIR;

    // D:\data 폴더를 /api/images/** 경로에 매핑하는 설정
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // HTTP 요청 경로: /api/images/로 시작하는 모든 요청을 처리
        registry.addResourceHandler("/api/images/**")
                .addResourceLocations("file:///" + BASE_DIR);
    }
}