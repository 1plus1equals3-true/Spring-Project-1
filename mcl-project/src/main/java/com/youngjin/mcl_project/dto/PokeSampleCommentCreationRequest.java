package com.youngjin.mcl_project.dto;

import lombok.Data;

@Data
public class PokeSampleCommentCreationRequest {

    // ⭐️ 댓글이 달릴 샘플 ID (기존 boardIdx 대응)
    private Long sampleIdx;

    // 댓글 내용
    private String ment;

    // 부모 댓글 ID (대댓글일 경우, 없으면 null)
    private Long parentIdx;
}