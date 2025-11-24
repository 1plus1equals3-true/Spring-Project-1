package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSample;
import com.youngjin.mcl_project.entity.PokeSampleLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PokeSampleLikeRepository extends JpaRepository<PokeSampleLike, Long> {
    // 이미 좋아요를 눌렀는지 확인용
    boolean existsByPokeSampleAndMemberIdx(PokeSample pokeSample, long memberIdx);

    // 좋아요 취소용
    void deleteByPokeSampleAndMemberIdx(PokeSample pokeSample, long memberIdx);
}