package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.BoardAttachmentsEntity; // 파일 엔티티로 가정
import com.youngjin.mcl_project.entity.BoardAttachmentsEntity.FileStatus; // ⭐️ FileStatus import 경로 수정
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardAttachmentsRepository extends JpaRepository<BoardAttachmentsEntity, Long> {

    /**
     * [게시글 작성/수정 시 사용]
     * 임시 파일들의 상태를 ACTIVE로 변경하고, 게시글 ID(FK)를 연결합니다.
     *
     * @param fileIdxList 업데이트할 파일 ID 목록
     * @param boardIdx 연결할 게시글 ID
     * @param status 변경할 상태 (ACTIVE)
     * @return 업데이트된 레코드 수
     */
    @Modifying // DML(INSERT, UPDATE, DELETE) 쿼리임을 명시
    @Query("UPDATE BoardAttachmentsEntity a SET a.boardIdx = :boardIdx, a.status = :status WHERE a.idx IN :fileIdxList AND a.status = 'TEMP'")
    int updateStatusAndBoardIdx(@Param("fileIdxList") List<Long> fileIdxList,
                                @Param("boardIdx") long boardIdx,
                                @Param("status") FileStatus status);

    /**
     * [게시글 수정 시 사용]
     * 특정 게시글에 연결된 파일들의 상태를 TEMP로 리셋합니다.
     * 이는 수정 후 최종 저장된 파일 목록에 포함되지 않은 파일들을 '삭제 대기' 상태로 만들기 위함입니다.
     *
     * @param boardIdx 초기화할 파일들이 연결된 게시글 ID
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Query("UPDATE BoardAttachmentsEntity a SET a.boardIdx = null, a.status = 'TEMP' WHERE a.boardIdx = :boardIdx AND a.status = 'ACTIVE'")
    int resetFilesToTemp(@Param("boardIdx") long boardIdx);

    // 💡 상세 조회 시 파일 목록 DTO 변환을 위한 조회 메서드 (BoardDetailResponse 생성 시 필요)
    // List<BoardAttachmentsEntity> findAllByBoardIdx(long boardIdx);
}