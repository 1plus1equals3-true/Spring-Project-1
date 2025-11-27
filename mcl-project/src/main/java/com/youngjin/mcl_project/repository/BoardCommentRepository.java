package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.BoardCommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardCommentRepository extends JpaRepository<BoardCommentEntity, Long> {

    // 1. 특정 게시글의 댓글 개수 조회 (BoardListResponse를 위한 COUNT)
    // isDeleted가 있다면 isDeleted=false 조건 추가 필요
    long countByBoardIdxAndIsDeletedFalse(long boardIdx);

    // 2. 특정 게시글의 댓글 목록 조회 (BoardDetailResponse의 댓글 섹션)
    // 댓글과 답글을 계층적으로 정렬하기 위해 regdate 오름차순 또는 원하는 정렬 기준 사용
    // isDeleted가 있다면 isDeleted=false 조건 추가 필요
    List<BoardCommentEntity> findAllByBoardIdxOrderByRegdateAsc(long boardIdx);

    // 3. (추가 기능) 대댓글 구현 시 parent_idx가 NULL인 최상위 댓글 목록 조회
    // List<BoardCommentEntity> findAllByBoardIdxAndParentIdxIsNullOrderByRegdateAsc(long boardIdx);

    /**
     * [게시글 삭제 시 사용]
     * 특정 게시글에 연결된 모든 댓글을 소프트 삭제(isDeleted=true)합니다.
     * @param boardIdx 삭제할 댓글들이 연결된 게시글 ID
     * @return 업데이트된 레코드 수
     */
    @Modifying
    // ⭐️ 게시글 삭제 시 연결된 댓글 소프트 삭제
    @Query("UPDATE BoardCommentEntity c SET c.isDeleted = true WHERE c.boardIdx = :boardIdx AND c.isDeleted = false")
    int softDeleteAllByBoardIdx(@Param("boardIdx") long boardIdx);

    // 특정 사용자의 최신 댓글 조회
    Page<BoardCommentEntity> findByMemberIdxAndIsDeletedFalseOrderByRegdateDesc(long memberIdx, Pageable pageable);
}