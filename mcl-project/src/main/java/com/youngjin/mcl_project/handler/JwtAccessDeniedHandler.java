package com.youngjin.mcl_project.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    @Value("${frontend.base-url}")
    private String FRONT_URL;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {

        response.setHeader("Access-Control-Allow-Origin", FRONT_URL);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        // Access Token은 있지만, 해당 리소스에 접근할 권한(ROLE)이 없을 때 403 Forbidden 응답을 반환
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403

        // JSON 형식으로 메시지 작성
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("error", "Forbidden");
        errorDetails.put("message", "접근 권한이 없습니다. (요구되는 등급: " + accessDeniedException.getMessage() + ")");

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorDetails));
    }
}