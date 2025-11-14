package com.youngjin.mcl_project.dto;

import java.util.Map;

// 각 소셜 서비스의 사용자 정보를 공통된 형태로 추출하기 위한 인터페이스
public interface OAuth2UserInfo {
    String getProviderId(); // 소셜 서비스 고유 ID
    String getProvider();   // 소셜 서비스 이름 (naver, kakao)
    String getNickname();   // 사용자 닉네임
    String getProfileImage(); // 프로필 이미지 URL (선택)
    String getEmail();      // 이메일 (사용안함)
    Map<String, Object> getAttributes(); // 원본 정보
}