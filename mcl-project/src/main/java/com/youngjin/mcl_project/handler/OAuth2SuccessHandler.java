package com.youngjin.mcl_project.handler;

import com.youngjin.mcl_project.dto.KakaoUserInfo;
import com.youngjin.mcl_project.dto.NaverUserInfo;
import com.youngjin.mcl_project.dto.OAuth2UserInfo;
import com.youngjin.mcl_project.jwt.TokenProvider;
import com.youngjin.mcl_project.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenProvider tokenProvider;
    private final MemberService memberService;
    // private final String TARGET_URL = "http://localhost:5173";
    private final String TARGET_URL = "https://localhost:5173";
    // TODO: React 실제 URL.

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 1. 사용자 정보 추출
        String registrationId = getRegistrationId(request);
        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());
        String providerId = userInfo.getProviderId();

        // 2. DB에서 저장된 MemberEntity를 조회하여 grade를 가져옴
        long userGrade = memberService.getGradeByProviderId(providerId);

        // 3. 토큰 생성
        String accessToken = tokenProvider.createAccessToken(providerId, userGrade); // ⭐️ grade 사용
        String refreshToken = tokenProvider.createRefreshToken(providerId);

        // ⭐️ 4. MemberService를 통해 Refresh Token을 DB에 저장/업데이트
        memberService.updateRefreshToken(providerId, refreshToken);

        // 4. 쿠키에 토큰 담기 (HttpOnly, Secure)
        // Access Token 쿠키 생성 (짧은 유효 기간)
        addCookie(response, "accessToken", accessToken, 3600); // 1시간 (Access Token 만료 시간과 일치시킴)

        // Refresh Token 쿠키 생성 (긴 유효 기간)
        addCookie(response, "refreshToken", refreshToken, 604800); // 7일

        // 5. 닉네임을 URL에 담아 전달 (HttpOnly가 아니므로 쿼리나 별도 쿠키/헤더로 전달 가능)
        String encodedNickname = URLEncoder.encode(userInfo.getNickname(), StandardCharsets.UTF_8.toString());

        String targetUri = UriComponentsBuilder.fromUriString(TARGET_URL + "/oauth/callback")
                .queryParam("nickname", encodedNickname)
                .queryParam("token", "true")
                .build().toUriString();

        log.info("JWT 토큰 쿠키 발급 및 리다이렉트: {}", targetUri);
        getRedirectStrategy().sendRedirect(request, response, targetUri);
    }

    // ⭐️ HttpOnly 쿠키를 생성하는 헬퍼 메서드
    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        // ⭐️ Secure 속성을 다시 포함합니다.
        String cookieHeader = String.format("%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure",
                name,
                value,
                maxAge);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    // 💡 수정된 헬퍼 메서드: request를 매개변수로 받도록 변경
    private String getRegistrationId(HttpServletRequest request) {
        String requestUri = request.getRequestURI(); // 인수로 받은 request 객체 사용
        return requestUri.substring(requestUri.lastIndexOf('/') + 1);
    }

    // CustomOAuth2UserService의 getOAuth2UserInfo 로직을 재사용하여 토큰에 필요한 정보 추출
    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return new NaverUserInfo(attributes);
        } else if ("kakao".equals(registrationId)) {
            return new KakaoUserInfo(attributes);
        }
        throw new IllegalArgumentException("지원하지 않는 소셜 로그인: " + registrationId);
    }
}