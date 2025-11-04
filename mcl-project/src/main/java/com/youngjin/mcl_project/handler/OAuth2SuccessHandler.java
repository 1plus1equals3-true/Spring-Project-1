package com.youngjin.mcl_project.handler;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import com.youngjin.mcl_project.jwt.TokenProvider;
import com.youngjin.mcl_project.service.CustomOAuth2UserService; // providerId 추출을 위해 CustomUserService 로직 필요
import com.youngjin.mcl_project.dto.OAuth2UserInfo; // 정보 추출을 위해 필요
import com.youngjin.mcl_project.dto.KakaoUserInfo;
import com.youngjin.mcl_project.dto.NaverUserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenProvider tokenProvider;

    // ⭐️ 프론트엔드 리다이렉트 URL (React 개발 서버 주소)
    // 이 URL로 JWT 토큰이 쿼리 파라미터로 전달됩니다. React에서 이 토큰을 받아서 저장해야 합니다.
    private final String TARGET_URL = "http://localhost:5173/oauth/redirect";
    // TODO: React 프로젝트 시작 후 실제 URL로 변경해 주세요.

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 1. 필요한 정보 추출 (기존 코드 유지)
        String registrationId = getRegistrationId(request);
        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String providerId = userInfo.getProviderId();
        String role = "ROLE_USER";

        // ⭐ ⭐ ⭐ 수정이 필요한 부분 시작 ⭐ ⭐ ⭐
        String nickname = userInfo.getNickname();

        // 2. 닉네임을 URL 안전하게 인코딩
        // 자바 10 이상: StandardCharsets.UTF_8 사용
        String encodedNickname = URLEncoder.encode(nickname, StandardCharsets.UTF_8.toString());

        // 3. JWT 토큰 생성 (기존 코드 유지)
        String token = tokenProvider.createToken(providerId, role);

        // 4. 토큰과 인코딩된 닉네임을 쿼리 파라미터에 담아 프론트엔드로 리다이렉트
        String targetUri = UriComponentsBuilder.fromUriString(TARGET_URL)
                .queryParam("token", token)
                .queryParam("nickname", encodedNickname) // ⭐ 인코딩된 닉네임 변수 사용
                .build().toUriString();

        // ⭐ ⭐ ⭐ 수정이 필요한 부분 끝 ⭐ ⭐ ⭐

        log.info("JWT 토큰 발급 및 리다이렉트: {}", targetUri);
        getRedirectStrategy().sendRedirect(request, response, targetUri);
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