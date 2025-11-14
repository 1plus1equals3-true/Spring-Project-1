package com.youngjin.mcl_project.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 로그인된 사용자 정보를 프론트엔드에 전달하기 위한 DTO
 */
@Getter
@Builder
public class AuthUserResponse {

    private final String nickname;

    private final long grade;

    // 서비스에서 완성된 경로를 받아 사용
    private final String profileImageUrl;
}