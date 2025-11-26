package com.youngjin.mcl_project.dto;

import lombok.Data;

@Data
public class PokeSampleCommentUpdateRequest {

    // 수정할 댓글 ID
    private Long idx;

    // 수정할 내용
    private String ment;
}