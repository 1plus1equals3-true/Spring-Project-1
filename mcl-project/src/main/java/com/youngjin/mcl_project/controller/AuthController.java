package com.youngjin.mcl_project.controller;

// Spring MVC 및 Core

import com.youngjin.mcl_project.jwt.TokenProvider;
import com.youngjin.mcl_project.service.MemberService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TokenProvider tokenProvider;
    private final MemberService memberService;

    // Refresh Token을 사용하여 새 Access Token을 발급받는 API
    @PostMapping("/reissue")
    public ResponseEntity<?> reissueAccessToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
            return new ResponseEntity<>("Refresh Token이 유효하지 않거나 없습니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            // 1. Refresh Token에서 Subject (providerId) 추출
            String providerId = tokenProvider.getAuthentication(refreshToken).getName();

            // 2. DB에서 사용자 grade 조회
            long userGrade = memberService.getGradeByProviderId(providerId);

            // 3. 새 Access Token 생성
            String newAccessToken = tokenProvider.createAccessToken(providerId, userGrade);

            // 4. 새 Access Token을 쿠키에 담아 반환 (기존 쿠키 덮어쓰기)
            // Access Token 만료 시간(1시간)을 maxAge로 설정
            int accessTokenMaxAge = 3600;
            Cookie newAccessCookie = new Cookie("accessToken", newAccessToken);
            newAccessCookie.setPath("/");
            newAccessCookie.setHttpOnly(true);
            newAccessCookie.setMaxAge(accessTokenMaxAge);

            // ⭐️ 쿠키 객체 직접 추가로 단순화
            response.addCookie(newAccessCookie);
            // 🚨 기존에 직접 추가했던 Set-Cookie 헤더 로직은 제거

            return ResponseEntity.ok("Access Token이 성공적으로 재발급되었습니다.");

        } catch (Exception e) {
            // 토큰 파싱 또는 DB 조회 실패 시
            return new ResponseEntity<>("토큰 재발급에 실패했습니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * 로그아웃: Access/Refresh Token 쿠키를 삭제합니다.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Access Token 쿠키 삭제 (만료 시간을 0으로 설정)
        Cookie accessCookie = new Cookie("accessToken", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        // Refresh Token 쿠키 삭제 (만료 시간을 0으로 설정)
        Cookie refreshCookie = new Cookie("refreshToken", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        // ⭐️ 필요하다면 DB/Redis에 Refresh Token을 블랙리스트 처리하는 로직 추가

        return ResponseEntity.ok("로그아웃 및 쿠키 삭제 완료");
    }
}