package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.entity.PokeSampleLikeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PokeSampleLikeRepository extends JpaRepository<PokeSampleLikeEntity, Long> {
    boolean existsByPokeSampleAndMemberIdx(PokeSampleEntity pokeSample, long memberIdx);
    void deleteByPokeSampleAndMemberIdx(PokeSampleEntity pokeSample, long memberIdx);

    // 좋아요 누른 목록 조회 (페이징)
    Page<PokeSampleLikeEntity> findByMemberIdxOrderByRegdateDesc(Long memberIdx, Pageable pageable);
}