package com.youngjin.mcl_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.youngjin.mcl_project.entity.BoardCommentEntity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BoardCommentResponse {

    private long idx;
    private long boardIdx;
    private Long parentIdx;

    // ⭐️ JOIN 필요 필드 (작성자 닉네임)
    private String authorNickname;

    // ⭐️ 내용 및 상태
    private String ment;
    private LocalDateTime regdate;
    private LocalDateTime moddate;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    // ⭐️ 계층형 구조를 위한 대댓글 목록
    private List<BoardCommentResponse> replies;

    /**
     * Entity -> DTO 변환 (기본 정보)
     * 이 메서드는 서비스 레이어에서 닉네임과 계층 구조를 채우기 위해 사용됩니다.
     */
    public static BoardCommentResponse fromEntity(BoardCommentEntity entity) {
        // 댓글이 삭제된 경우 내용 마스킹 처리
        String content = entity.isDeleted() ? "삭제된 댓글입니다." : entity.getMent();

        return BoardCommentResponse.builder()
                .idx(entity.getIdx())
                .boardIdx(entity.getBoardIdx())
                .parentIdx(entity.getParentIdx())
                // .authorNickname(nickname) // Service에서 채워야 함
                .ment(content)
                .regdate(entity.getRegdate())
                .moddate(entity.getModdate())
                .isDeleted(entity.isDeleted())
                // .replies(new ArrayList<>()) // 계층 구조를 위해 Service에서 초기화
                .build();
    }
}