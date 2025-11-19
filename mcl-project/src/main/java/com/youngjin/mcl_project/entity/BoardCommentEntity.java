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
@Table(name = "board_comments")
public class BoardCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idx;

    // ⭐️ 게시글 ID (FK)
    // board_idx는 게시글에 반드시 연결되어야 하므로 NULL을 허용하지 않습니다.
    // DB 스키마에 맞춰 INT 타입이므로 long (원시 타입) 사용
    @Column(name = "board_idx", nullable = false)
    private long boardIdx;

    // ⭐️ 작성자 ID (FK)
    // member_idx는 작성자를 나타내며, 탈퇴 등의 처리를 위해 Long (래퍼 클래스)을 고려할 수 있지만,
    // DB 스키마가 INT(NOT NULL)이라면 long (원시 타입)을 사용합니다.
    @Column(name = "member_idx", nullable = false)
    private long memberIdx;

    // ⭐️ 댓글 내용
    @Lob // 내용이 길 수 있으므로 TEXT 매핑을 위한 어노테이션 사용 (DB 타입에 따라)
    @Column(name = "ment", nullable = false)
    private String ment;

    // ⭐️ 생성일시
    // DB의 DATETIME 타입과 매핑.
    // 생성일시는 필수 값이므로 nullable = false로 처리하는 것을 권장합니다.
    @Column(name = "regdate", nullable = false)
    private LocalDateTime regdate;

    // 💡 수정일시
    @Column(name = "moddate")
    private LocalDateTime moddate;

    // 💡 삭제 여부 (소프트 삭제)
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    // 💡 계층형 댓글을 위한 부모 ID
    @Column(name = "parent_idx")
    private Long parentIdx;
}