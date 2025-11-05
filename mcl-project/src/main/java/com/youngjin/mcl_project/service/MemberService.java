package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}