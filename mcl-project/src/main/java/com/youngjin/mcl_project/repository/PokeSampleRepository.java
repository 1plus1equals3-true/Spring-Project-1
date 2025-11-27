package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.enums.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PokeSampleRepository extends JpaRepository<PokeSampleEntity, Long> {

    // 1. 특정 포켓몬 조회 + 페이징 + PUBLIC
    Page<PokeSampleEntity> findByPokemonIdxAndIsDeletedFalseAndVisibilityOrderByRegdateDesc(
            Integer pokemonIdx, Visibility visibility, Pageable pageable);

    // 2. 검색 + 페이징 + PUBLIC
    Page<PokeSampleEntity> findByPokemonNameContainingAndIsDeletedFalseAndVisibilityOrderByRegdateDesc(
            String keyword, Visibility visibility, Pageable pageable);

    // 3. 전체 조회 + 페이징 + PUBLIC
    Page<PokeSampleEntity> findAllByIsDeletedFalseAndVisibilityOrderByRegdateDesc(
            Visibility visibility, Pageable pageable);

    // 4. 상세 조회용 (삭제 안 된 것만) - 상세 조회는 PUBLIC/PRIVATE 체크를 Service에서 함
    Optional<PokeSampleEntity> findByIdxAndIsDeletedFalse(Long idx);

    // 5. 내 샘플 조회 (PUBLIC + PRIVATE 모두 포함) -> 기존 유지
    List<PokeSampleEntity> findByMemberIdxAndIsDeletedFalseOrderByRegdateDesc(long memberIdx);

    // 5-2. (추가) 내 샘플 조회 + 페이징 (나중에 필요할 수 있음)
    Page<PokeSampleEntity> findByMemberIdxAndIsDeletedFalseOrderByRegdateDesc(long memberIdx, Pageable pageable);

    // 6. 좋아요 순으로 상위 N개 조회 (PUBLIC만)
    List<PokeSampleEntity> findTop3ByIsDeletedFalseAndVisibilityOrderByLikeCountDesc(Visibility visibility);
}