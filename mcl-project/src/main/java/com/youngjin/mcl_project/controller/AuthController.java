package com.youngjin.mcl_project.controller;

// Spring MVC 및 Core

import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.jwt.TokenProvider;
import com.youngjin.mcl_project.service.MemberService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
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

        if (refreshToken == null) {
            return new ResponseEntity<>("Refresh Token이 없습니다.", HttpStatus.UNAUTHORIZED);
        }

        // 1. Refresh Token 자체의 유효성 검사 (서명, 만료 여부)
        if (!tokenProvider.validateToken(refreshToken)) {
            // 만료되었다면 401 반환 (재로그인 유도)
            return new ResponseEntity<>("만료되거나 잘못된 Refresh Token입니다.", HttpStatus.UNAUTHORIZED);
        }

        // ⭐️ 2. DB에 저장된 Refresh Token과 일치하는지 확인 (가장 중요한 보안 검증)
        // MemberService에서 Refresh Token으로 회원 엔티티를 찾음
        Optional<MemberEntity> memberOptional = memberService.findByRefreshToken(refreshToken);

        if (memberOptional.isEmpty()) {
            // DB에 없으면 유효하지 않은 토큰 (탈취, 이미 재발급되어 폐기된 토큰 등)
            return new ResponseEntity<>("DB에 저장되지 않은 Refresh Token입니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            MemberEntity member = memberOptional.get();
            String providerId = member.getProviderId(); // DB에서 providerId를 가져오는 것이 더 확실

            // 3. 새 Access Token 생성
            long userGrade = member.getGrade(); // DB에서 grade 조회
            String newAccessToken = tokenProvider.createAccessToken(providerId, userGrade);

            // ⭐️ 4. (보안 강화) 새 Refresh Token 발급 및 DB 업데이트 (롤링 방식)
            String newRefreshToken = tokenProvider.createRefreshToken(providerId);
            memberService.updateRefreshToken(providerId, newRefreshToken);

            // 5. 새 Access Token 및 Refresh Token 쿠키에 담아 반환 (기존 쿠키 덮어쓰기)
            addCookieHeader(response, "accessToken", newAccessToken, 3600);
            addCookieHeader(response, "refreshToken", newRefreshToken, 604800); // ⭐️ 새 Refresh Token도 쿠키에 담기

            return ResponseEntity.ok("Access Token이 성공적으로 재발급되었습니다.");

        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생: {}", e.getMessage());
            return new ResponseEntity<>("토큰 재발급 처리 중 서버 오류가 발생했습니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    // 💡 AuthController 내부에 쿠키 생성 헬퍼 메서드 추가 (코드 중복 방지)
    private void addCookieHeader(HttpServletResponse response, String name, String value, int maxAge) {
        String cookieHeader = String.format("%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure",
                name,
                value,
                maxAge);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    /**
     * 로그아웃: Access/Refresh Token 쿠키를 삭제합니다.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Access Token 쿠키 삭제 (만료 시간을 0으로 설정)
        String accessCookieHeader = "accessToken=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure"; // Secure 추가
        response.addHeader("Set-Cookie", accessCookieHeader);

        // Refresh Token 쿠키 삭제 (만료 시간을 0으로 설정)
        String refreshCookieHeader = "refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure"; // Secure 추가
        response.addHeader("Set-Cookie", refreshCookieHeader);

        return ResponseEntity.ok("로그아웃 및 쿠키 삭제 완료");
    }
}