package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSample;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PokeSampleRepository extends JpaRepository<PokeSample, Long> {
    // 1. 특정 포켓몬의 샘플 목록 조회 (최신순)
    List<PokeSample> findByPokemonIdxOrderByRegdateDesc(Integer pokemonIdx);

    // 2. 내가 쓴 샘플 목록 조회
    List<PokeSample> findByMemberIdxOrderByRegdateDesc(long memberIdx);
}