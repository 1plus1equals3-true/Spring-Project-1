package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.entity.PokeSampleLikeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface PokeSampleLikeRepository extends JpaRepository<PokeSampleLikeEntity, Long> {
    boolean existsByPokeSampleAndMemberIdx(PokeSampleEntity pokeSample, long memberIdx);
    void deleteByPokeSampleAndMemberIdx(PokeSampleEntity pokeSample, long memberIdx);

    // 좋아요 누른 목록 조회 (페이징)
    Page<PokeSampleLikeEntity> findByMemberIdxOrderByRegdateDesc(Long memberIdx, Pageable pageable);

    // 최근 N일간 좋아요를 많이 받은 샘플 ID 조회 (내림차순)
    // JPQL 사용: Like 테이블에서 regdate가 특정 시간 이후인 것들을 그룹화하여 count 순으로 정렬
    @Query("SELECT l.pokeSample.idx FROM PokeSampleLikeEntity l " +
            "WHERE l.regdate >= :startDate " +
            "GROUP BY l.pokeSample.idx " +
            "ORDER BY COUNT(l) DESC")
    List<Long> findTopSampleIdsByDateAfter(LocalDateTime startDate, Pageable pageable);
}