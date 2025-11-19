package com.youngjin.mcl_project.dto;

import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BoardListResponse {

    // 엔티티 필드
    private long idx;
    private BoardType boardType;
    private String title;
    private long hit;
    private long recommend;
    private LocalDateTime regdate;

    // ⭐️ JOIN 필요 필드
    private String authorNickname; // member_idx를 이용해 가져올 작성자 닉네임
    private long commentCount;     // 댓글 테이블에서 해당 게시글의 댓글 개수
}