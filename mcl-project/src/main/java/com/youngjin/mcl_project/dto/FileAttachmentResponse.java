package com.youngjin.mcl_project.dto;

import com.youngjin.mcl_project.entity.BoardAttachmentsEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileAttachmentResponse {
    private long idx;
    private String originalName;
    private String storedName;
    private String fileUrl; // 필요한 경우 전체 URL 반환

    // 엔티티 -> DTO 변환 메서드
    public static FileAttachmentResponse fromEntity(BoardAttachmentsEntity entity) {

        String fullUrl = "/api/images/" + entity.getDir() + "/" + entity.getStoredName();

        return FileAttachmentResponse.builder()
                .idx(entity.getIdx())
                .originalName(entity.getOriginalName())
                .storedName(entity.getStoredName())
                .fileUrl(fullUrl)
                .build();
    }
}