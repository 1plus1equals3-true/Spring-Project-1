package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.BoardEntity;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.entity.BoardRecommendEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardRecommendRepository extends JpaRepository<BoardRecommendEntity, Long> {

    // 이미 추천했는지 확인
    boolean existsByMemberAndBoard(MemberEntity member, BoardEntity board);

    // 추천 취소를 위해 찾기
    Optional<BoardRecommendEntity> findByMemberAndBoard(MemberEntity member, BoardEntity board);

    // 특정 게시글의 추천 수 직접 카운트 (필요시 사용)
    long countByBoard(BoardEntity board);
}