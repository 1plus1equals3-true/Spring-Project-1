package com.youngjin.mcl_project.dto;

import lombok.Data;

@Data
public class BoardCommentUpdateRequest {

    // ⭐️ 수정 대상 댓글 ID
    private long idx;

    // ⭐️ 수정할 댓글 내용
    private String ment;
}