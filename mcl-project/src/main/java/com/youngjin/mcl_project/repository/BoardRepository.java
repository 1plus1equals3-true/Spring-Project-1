package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.BoardEntity;
import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<BoardEntity, Long> {

    // 1. 특정 게시판 타입(NOTICE/FREE)에 해당하는 게시글 목록을 페이징하여 조회
    // isDeleted = false 인 활성화된 게시글만 조회해야 합니다.
    Page<BoardEntity> findAllByBoardTypeAndIsDeletedFalse(BoardType boardType, Pageable pageable);

    // 2. 공지사항만 별도로 조회 (목록 상단 고정용)
    // isDeleted = false 인 활성화된 공지사항만 조회, 페이징은 필요 없을 수 있음.
    List<BoardEntity> findAllByBoardTypeAndIsDeletedFalseOrderByRegdateDesc(BoardType boardType);

    // 3. 특정 게시글의 상세 정보 조회 (삭제되지 않은 것만)
    // findById는 Optional<T>를 반환합니다.
    BoardEntity findByIdxAndIsDeletedFalse(long idx);

    // 4. (선택) 제목 또는 내용으로 검색
    Page<BoardEntity> findByTitleContainingOrContentContainingAndBoardTypeAndIsDeletedFalse(
            String titleKeyword, String contentKeyword, BoardType boardType, Pageable pageable);

    // 특정 사용자의 최신 게시글 조회 (Pageable로 개수 제한)
    Page<BoardEntity> findByMemberIdxAndIsDeletedFalseOrderByRegdateDesc(long memberIdx, Pageable pageable);
}