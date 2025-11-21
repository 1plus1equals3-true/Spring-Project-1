package com.youngjin.mcl_project.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BoardImageUploadResponse {
    // 게시글 작성 시 서버로 다시 보내줘야 할 파일 ID
    private long fileIdx;

    // 에디터 본문에 <img> 태그로 삽입될 이미지 접근 URL
    private String fileUrl;

    // 원본 파일명 (필요 시 사용)
    private String originalFilename;
}