package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSampleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PokeSampleRepository extends JpaRepository<PokeSampleEntity, Long> {

    // 1. 특정 포켓몬 조회 + 페이징
    Page<PokeSampleEntity> findByPokemonIdxAndIsDeletedFalseOrderByRegdateDesc(Integer pokemonIdx, Pageable pageable);

    // 2. 검색 + 페이징
    Page<PokeSampleEntity> findByPokemonNameContainingAndIsDeletedFalseOrderByRegdateDesc(String keyword, Pageable pageable);

    // 3. 전체 조회 + 페이징
    Page<PokeSampleEntity> findAllByIsDeletedFalseOrderByRegdateDesc(Pageable pageable);

    // 4. 상세 조회용 (삭제 안 된 것만)
    Optional<PokeSampleEntity> findByIdxAndIsDeletedFalse(Long idx);

    // 5. 내 샘플 조회 (이건 List로 유지해도 됨, 나중에 페이징 필요하면 변경)
    List<PokeSampleEntity> findByMemberIdxAndIsDeletedFalseOrderByRegdateDesc(long memberIdx);
}