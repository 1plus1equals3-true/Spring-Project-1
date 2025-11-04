package com.youngjin.mcl_project.dto;

import java.util.Map;

public class NaverUserInfo implements OAuth2UserInfo {

    private Map<String, Object> attributes;
    private Map<String, Object> response; // 네이버는 "response" 안에 실제 정보가 있습니다.
    private String registrationId = "naver";

    public NaverUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
        // user-name-attribute가 "response"로 설정되어 있으므로, 한 번 더 맵을 추출합니다.
        this.response = (Map<String, Object>) attributes.get("response");
    }

    @Override
    public String getProviderId() {
        // 네이버의 고유 ID는 "response" 맵 안의 "id" 필드입니다.
        return (String) response.get("id");
    }

    @Override
    public String getProvider() {
        return registrationId;
    }

    @Override
    public String getNickname() {
        return (String) response.get("nickname");
    }

    @Override
    public String getProfileImage() {
        return (String) response.get("profile_image");
    }

    @Override
    public String getEmail() {
//        return (String) response.get("email");
        return null;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}