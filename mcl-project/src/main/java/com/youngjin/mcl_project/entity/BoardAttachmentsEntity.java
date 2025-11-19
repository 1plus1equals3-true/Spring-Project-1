package com.youngjin.mcl_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "board_attachments")
public class BoardAttachmentsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idx;

    // ⭐️ 게시글 ID (FK)
    // DB에서 NULL을 허용하므로, Java에서는 Long (래퍼 클래스)을 사용해야 null 저장 가능
    @Column(name = "board_idx")
    private Long boardIdx;

    // ⭐️ 파일 저장 경로 (예: 2025/11/18)
    @Column(name = "dir", length = 200, nullable = false)
    private String dir;

    // ⭐️ 서버에 저장된 고유 파일명 (예: uuid.png)
    @Column(name = "stored_name", length = 200, nullable = false)
    private String storedName;

    // ⭐️ 사용자가 업로드한 원래 파일명
    @Column(name = "original_name", length = 200, nullable = false)
    private String originalName;

    // ⭐️ 파일 상태 (ENUM 매핑)
    // DB의 'temp', 'active' 문자열과 매핑
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 10, nullable = false)
    @Builder.Default
    private FileStatus status = FileStatus.TEMP;

    // ⭐️ 파일 생성/업로드 일시
    // DB의 DATETIME 타입과 매핑. TIMESTAMP 대신 DATETIME을 사용했으므로 LocalDateTime 사용
    @Column(name = "regdate")
    private LocalDateTime regdate;

    // 필드 추가 권고: 파일 크기 (BIGINT)
    // private long fileSize;

    // 필드 추가 권고: MIME 타입 (VARCHAR)
    // private String mimeType;

    public enum FileStatus {
        TEMP,    // 임시 파일 (아직 게시글에 연결되지 않음)
        ACTIVE   // 활성 파일 (게시글에 연결되어 사용 중)
    }
}
