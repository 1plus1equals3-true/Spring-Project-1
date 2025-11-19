package com.youngjin.mcl_project.dto;

import lombok.Data;

import java.util.List;

@Data
public class BoardUpdateRequest {

    private long idx; // ⭐️ 수정 대상 게시글의 PK
    private String title;
    private String content;

    // ⭐️ 수정 후 최종 첨부 파일 목록
    private List<Long> fileIdxList;
}