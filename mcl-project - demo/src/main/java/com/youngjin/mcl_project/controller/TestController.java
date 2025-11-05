package com.youngjin.mcl_project.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
public class TestController {

    /**
     * @AuthenticationPrincipal을 사용하여 현재 로그인한(인증된) 사용자의 정보를 가져옵니다.
     */
    @GetMapping("/info")
    public String getUserInfo(@AuthenticationPrincipal User principal) { // ⭐️ 타입을 User로 변경

        if (principal == null) {
            // 이 코드는 인증에 성공하면 실행되지 않지만, 만약을 위해 남겨둡니다.
            return "사용자 정보 로드 실패: Principal 객체가 null입니다.";
        }

        // Spring Security User 객체의 getUsername() 메서드는 JWT의 Subject(ProviderId)를 반환합니다.
        String providerId = principal.getUsername();

        return String.format("✅ 인증 성공! Provider ID: %s. 현재 인증된 요청입니다.", providerId);
    }

    /**
     * 인증 없이 접근 가능한 공개 테스트용 엔드포인트
     */
    @GetMapping("/public")
    public String publicTest() {
        return "여기는 누구나 접근할 수 있는 공개 API입니다.";
    }
}