package com.youngjin.mcl_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.youngjin.mcl_project.entity.PokeSampleComment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class PokeSampleCommentResponse {

    private Long idx;
    private Long sampleIdx;
    private Long parentIdx;

    private String authorNickname; // 작성자 닉네임

    private String ment;
    private LocalDateTime regdate;
    private LocalDateTime moddate;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    // 대댓글 리스트
    private List<PokeSampleCommentResponse> replies;

    /**
     * Entity -> DTO 변환
     */
    public static PokeSampleCommentResponse fromEntity(PokeSampleComment entity) {
        // 삭제된 댓글 마스킹 처리
        String content = entity.isDeleted() ? "삭제된 댓글입니다." : entity.getMent();

        // parent가 null이면 null, 있으면 idx 반환
        Long parentId = (entity.getParent() != null) ? entity.getParent().getIdx() : null;

        return PokeSampleCommentResponse.builder()
                .idx(entity.getIdx())
                .sampleIdx(entity.getPokeSample().getIdx()) // 연관관계에서 ID 추출
                .parentIdx(parentId)
                .ment(content)
                .regdate(entity.getRegdate())
                .moddate(entity.getModdate())
                .isDeleted(entity.isDeleted())
                .replies(new ArrayList<>()) // 초기화
                .build();
    }
}