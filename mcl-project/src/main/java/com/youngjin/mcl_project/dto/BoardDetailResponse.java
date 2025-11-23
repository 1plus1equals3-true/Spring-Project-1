package com.youngjin.mcl_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import lombok.Builder;
import lombok.Data;
import java.util.List;

import java.time.LocalDateTime;

@Data
@Builder
public class BoardDetailResponse {

    // 엔티티 필드
    private long idx;
    private BoardType boardType;
    private String title;
    private String content; // 상세 페이지이므로 content 포함
    private long hit;
    private long recommend;
    private LocalDateTime regdate;
    private LocalDateTime moddate;

    // ⭐️ JOIN 필요 필드
    private String authorNickname; // 작성자 닉네임

    // ⭐️ 첨부 파일 정보 (파일 엔티티를 DTO로 변환하여 리스트로 제공)
    private List<FileAttachmentResponse> attachments;

    // 추천여부 json변환 시 이름 유지
    @JsonProperty("isRecommended")
    private boolean isRecommended;
}