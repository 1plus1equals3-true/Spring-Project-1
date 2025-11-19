package com.youngjin.mcl_project.dto;

import lombok.Data;

@Data
public class BoardCommentCreationRequest {

    // ⭐️ 댓글이 달릴 게시글 ID
    private long boardIdx;

    // ⭐️ 댓글 내용
    private String ment;

    // 💡 부모 댓글 ID (대댓글일 경우 필요, 최상위 댓글이면 null)
    private Long parentIdx;
}