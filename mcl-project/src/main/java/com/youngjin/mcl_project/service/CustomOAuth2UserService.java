package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.KakaoUserInfo;
import com.youngjin.mcl_project.dto.NaverUserInfo;
import com.youngjin.mcl_project.dto.OAuth2UserInfo;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Base64;

import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 기본 DefaultOAuth2UserService를 통해 사용자 정보를 가져옴
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // Naver, Kakao 정보를 표준화된 OAuth2UserInfo 객체로 변환
        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        // ⭐️ DB에 사용자 정보 저장 또는 업데이트 (Provider ID 기반)
        MemberEntity member = saveOrUpdate(oAuth2UserInfo);

        // Security Context에 저장할 OAuth2User 객체 반환
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")), // 권한은 일단 "ROLE_USER" 고정
                oAuth2User.getAttributes(),
                // oAuth2User.getName()이 providerId가 되도록 설정
                userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()
        );
    }

    // registrationId에 따라 알맞은 UserInfo 객체를 생성하는 팩토리 메서드
    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, java.util.Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return new NaverUserInfo(attributes);
        } else if ("kakao".equals(registrationId)) {
            return new KakaoUserInfo(attributes);
        }
        // Naver, Kakao 외의 다른 Provider가 들어오면 예외 발생
        throw new IllegalArgumentException("지원하지 않는 소셜 로그인: " + registrationId);
    }


    private MemberEntity saveOrUpdate(OAuth2UserInfo userInfo) {
        // ⭐️ Provider와 Provider ID 조합으로 DB에서 사용자를 찾습니다.
        MemberEntity member = memberRepository.findByProviderAndProviderId(
                        userInfo.getProvider(),
                        userInfo.getProviderId()
                )
                .map(entity -> {
                    // 기존 사용자: 닉네임, 프로필 이미지 등은 업데이트
                    entity.setNickname(userInfo.getNickname());
                    entity.setFile(userInfo.getProfileImage()); // file 필드를 프로필 이미지로 사용한다고 가정
                    return entity;
                })
                .orElseGet(() -> {
                    // 신규 사용자: MemberEntity 생성

                    // 소셜에서 받은 원본 닉네임
                    String originalNickname = userInfo.getNickname();

                    // 랜덤 10자리 (7바이트)
                    String randomId = generateSecureRandomId(7);

                    // 임시 닉네임 조합: "원본닉네임-RandomId" (구분자 '-'를 사용)
                    String tempNickname = originalNickname + "-" + randomId;

                    return MemberEntity.builder()
                            .userid(userInfo.getProvider() + "_" + userInfo.getProviderId())
                            .pwd("SOCIAL_LOGIN")
                            .nickname(tempNickname)
                            .file(userInfo.getProfileImage())
                            .grade(1)
                            .regdate(LocalDateTime.now())
                            .provider(userInfo.getProvider())
                            .providerId(userInfo.getProviderId())
                            .build();
                });

        return memberRepository.save(member);
    }

    private String generateSecureRandomId(int RANDOM_BYTE_LENGTH) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[RANDOM_BYTE_LENGTH];
        random.nextBytes(bytes);

        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        return encoded;
    }
}