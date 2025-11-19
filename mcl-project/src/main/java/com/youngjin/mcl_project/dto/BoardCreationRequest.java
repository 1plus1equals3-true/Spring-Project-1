package com.youngjin.mcl_project.dto;

import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import lombok.Data;

import java.util.List;

@Data
public class BoardCreationRequest {

    // 클라이언트가 입력하는 필수 필드
    private BoardType boardType;
    private String title;
    private String content;

    // ⭐️ 첨부 파일 목록
    // 글 작성 시 임시 저장된 파일들의 고유 ID(idx) 목록을 받습니다.
    private List<Long> fileIdxList;
}