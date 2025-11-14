package com.youngjin.mcl_project.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Security Context에서 현재 인증된 사용자의 정보를 가져오는 유틸리티 클래스
 */
@Slf4j
public class SecurityUtil {

    private SecurityUtil() {}

    /**
     * 현재 로그인된 사용자의 ProviderId (JWT Subject)를 반환합니다.
     */
    public static String getCurrentProviderId() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            log.error("Security Context에 인증 정보가 없습니다.");
            throw new RuntimeException("Security Context에 인증 정보가 없습니다.");
        }

        // JWT 인증 후 UsernamePasswordAuthenticationToken에 Principal로 설정된
        // Spring Security User 객체의 username (providerId)를 가져옵니다.
        return authentication.getName();
    }
}