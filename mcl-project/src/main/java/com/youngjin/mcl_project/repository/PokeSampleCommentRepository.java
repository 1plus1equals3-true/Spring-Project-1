package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSampleComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PokeSampleCommentRepository extends JpaRepository<PokeSampleComment, Long> {

    // 특정 샘플의 댓글 목록 조회 (부모 댓글만 조회 -> 대댓글은 Entity 연관관계로 가져옴)
    // N+1 문제를 방지하기 위해 @EntityGraph나 Fetch Join을 고려할 수 있지만,
    // 일단 기본적으로 parent가 null인(최상위) 댓글만 가져옵니다.
    @Query("SELECT c FROM PokeSampleComment c WHERE c.pokeSample.idx = :sampleIdx AND c.parent IS NULL ORDER BY c.idx ASC")
    List<PokeSampleComment> findRootCommentsBySampleIdx(@Param("sampleIdx") Long sampleIdx);

    // 특정 샘플의 모든 댓글 조회 (삭제된 것도 포함해서 가져와야 계층 구조가 깨지지 않음)
    List<PokeSampleComment> findAllByPokeSampleIdxOrderByRegdateAsc(Long sampleIdx);

    // 특정 샘플의 댓글 수 조회 (삭제되지 않은 것만)
    long countByPokeSampleIdxAndIsDeletedFalse(Long sampleIdx);
}