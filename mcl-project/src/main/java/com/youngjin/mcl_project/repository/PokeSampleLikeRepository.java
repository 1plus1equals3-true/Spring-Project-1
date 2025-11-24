package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.entity.PokeSampleLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PokeSampleLikeRepository extends JpaRepository<PokeSampleLikeEntity, Long> {
    boolean existsByPokeSampleAndMemberIdx(PokeSampleEntity pokeSample, long memberIdx);
    void deleteByPokeSampleAndMemberIdx(PokeSampleEntity pokeSample, long memberIdx);
}