package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<MemberEntity, Long>, MemberRepositoryCustom {
    Optional<MemberEntity> findByProviderAndProviderId(String provider, String providerId);
    Optional<MemberEntity> findByProviderId(String providerId);
    Optional<MemberEntity> findByRefreshToken(String refreshToken);
}
