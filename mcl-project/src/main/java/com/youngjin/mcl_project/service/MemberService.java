package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    /**
     * Provider ID를 사용하여 DB에서 회원의 등급(grade)을 조회합니다.
     * @param providerId 소셜 서비스 고유 ID
     * @return 회원의 등급 (grade, 없으면 기본값 1 반환)
     */
    public long getGradeByProviderId(String providerId) {
        return memberRepository.findByProviderId(providerId)
                .map(MemberEntity::getGrade)
                .orElse(1L);
    }

    /**
     * Refresh Token을 DB에 저장하거나 업데이트합니다.
     * @param providerId 소셜 로그인 고유 ID
     * @param refreshToken 새로 발급된 Refresh Token
     */
    @Transactional
    public void updateRefreshToken(String providerId, String refreshToken) {
        MemberEntity member = memberRepository.findByProviderId(providerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ProviderId의 회원을 찾을 수 없습니다: " + providerId));

        // ⭐️ 엔티티의 RefreshToken 필드를 업데이트
        member.updateRefreshToken(refreshToken);

        // save() 메서드를 명시적으로 호출하지 않아도 @Transactional에 의해 변경 감지(Dirty Checking)로 저장됩니다.
    }

    // 💡 참고: 재발급 시 사용할 조회 메서드도 미리 추가합니다.
    @Transactional(readOnly = true)
    public Optional<MemberEntity> findByRefreshToken(String refreshToken) {
        return memberRepository.findByRefreshToken(refreshToken);
    }
}