package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, Long>, MemberRepositoryCustom {
    Optional<MemberEntity> findByProviderAndProviderId(String provider, String providerId);
    Optional<MemberEntity> findByProviderId(String providerId);
    Optional<MemberEntity> findByRefreshToken(String refreshToken);
    Optional<MemberEntity> findByUserid(String userid);
    Optional<MemberEntity> findByNickname(String nickname);

    // @Query를 사용하여 단일 memberIdx로 닉네임 필드만 명시적으로 조회
    @Query("SELECT m.nickname FROM MemberEntity m WHERE m.idx = :memberIdx")
    Optional<String> findNicknameByIdx(@Param("memberIdx") long memberIdx);

    /**
     * 여러 memberIdx에 해당하는 닉네임과 idx를 한 번에 조회합니다.
     * 댓글 목록 조회 시 N+1 문제를 방지하기 위해 사용됩니다.
     * 결과는 Object[] {memberIdx, nickname} 형태로 반환됩니다.
     */
    @Query("SELECT m.idx, m.nickname FROM MemberEntity m WHERE m.idx IN :memberIdxs")
    List<Object[]> findAllNicknameByIdxs(@Param("memberIdxs") List<Long> memberIdxs);
}
