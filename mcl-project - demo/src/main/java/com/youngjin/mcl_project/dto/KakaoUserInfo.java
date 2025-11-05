package com.youngjin.mcl_project.dto;

import java.util.Map;

public class KakaoUserInfo implements OAuth2UserInfo {

    private Map<String, Object> attributes;
    private String registrationId = "kakao";

    public KakaoUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProviderId() {
        // 카카오의 고유 ID는 최상위 "id" 필드입니다. (Long 타입이므로 문자열로 변환)
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getProvider() {
        return registrationId;
    }

    @Override
    public String getNickname() {
        // 카카오는 kakao_account > profile > nickname 에 있습니다.
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount == null) return null;

        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        if (profile == null) return null;

        return (String) profile.get("nickname");
    }

    @Override
    public String getProfileImage() {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount == null) return null;

        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        if (profile == null) return null;

        return (String) profile.get("profile_image_url");
    }

    @Override
    public String getEmail() {
//        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
//        if (kakaoAccount == null) return null;
//
//        return (String) kakaoAccount.get("email");
        return null;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}