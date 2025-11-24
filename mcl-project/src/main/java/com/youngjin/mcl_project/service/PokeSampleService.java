package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.PokeSampleRequestDTO;
import com.youngjin.mcl_project.dto.PokeSampleResponseDTO;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.entity.PokeSampleLikeEntity;
import com.youngjin.mcl_project.repository.MemberRepository;
import com.youngjin.mcl_project.repository.PokeSampleLikeRepository;
import com.youngjin.mcl_project.repository.PokeSampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PokeSampleService {

    private final PokeSampleRepository pokeSampleRepository;
    private final MemberRepository memberRepository;
    private final PokeSampleLikeRepository likeRepository;

    // 1. 등록 (Create)
    @Transactional
    public Long createSample(PokeSampleRequestDTO dto) {
        PokeSampleEntity entity = dto.toEntity();
        PokeSampleEntity saved = pokeSampleRepository.save(entity);
        return saved.getIdx();
    }

    // 2. 상세 조회
    @Transactional
    public PokeSampleResponseDTO getSample(Long idx, String currentProviderId) {
        // 삭제 안 된 것만 조회
        PokeSampleEntity entity = pokeSampleRepository.findByIdxAndIsDeletedFalse(idx)
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않거나 삭제되었습니다."));

        entity.increaseHit();

        String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx())
                .orElse("알 수 없음");

        boolean isLiked = false;
        boolean isMine = false;

        if (currentProviderId != null) {
            MemberEntity currentMember = memberRepository.findByProviderId(currentProviderId)
                    .orElse(null);

            if (currentMember != null) {
                isLiked = likeRepository.existsByPokeSampleAndMemberIdx(entity, currentMember.getIdx());
                isMine = entity.getMemberIdx().equals(currentMember.getIdx());
            }
        }

        return PokeSampleResponseDTO.fromEntity(entity, nickname, isLiked, isMine);
    }

    // 3. 통합 목록 조회 (페이징 적용 - 전체, 특정, 검색 모두 처리)
    public Page<PokeSampleResponseDTO> getSamples(Integer pokemonIdx, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PokeSampleEntity> entityPage;

        if (pokemonIdx != null) {
            entityPage = pokeSampleRepository.findByPokemonIdxAndIsDeletedFalseOrderByRegdateDesc(pokemonIdx, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            entityPage = pokeSampleRepository.findByPokemonNameContainingAndIsDeletedFalseOrderByRegdateDesc(keyword, pageable);
        } else {
            entityPage = pokeSampleRepository.findAllByIsDeletedFalseOrderByRegdateDesc(pageable);
        }

        return entityPage.map(entity -> {
            String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx()).orElse("알 수 없음");
            return PokeSampleResponseDTO.fromEntity(entity, nickname, false, false);
        });
    }

    // 4. 수정 (Update)
    @Transactional
    public Long updateSample(Long idx, PokeSampleRequestDTO dto, Long currentMemberIdx) {
        PokeSampleEntity entity = pokeSampleRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않습니다."));

        if (!entity.getMemberIdx().equals(currentMemberIdx)) {
            throw new IllegalStateException("수정 권한이 없습니다.");
        }

        entity.updateSampleInfo(
                dto.getTeraType(), dto.getItem(), dto.getNature(), dto.getAbility(),
                dto.getIvs(), dto.getEvs(),
                dto.getMove1(), dto.getMove2(), dto.getMove3(), dto.getMove4(),
                dto.getDescription(), dto.getVisibility()
        );

        return entity.getIdx();
    }

    // 5. 삭제 (Soft Delete)
    @Transactional
    public void deleteSample(Long idx, Long currentMemberIdx) {
        PokeSampleEntity entity = pokeSampleRepository.findByIdxAndIsDeletedFalse(idx)
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않습니다."));

        if (!entity.getMemberIdx().equals(currentMemberIdx)) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }

        entity.changeDeleted(true);
    }

    // 6. 좋아요 토글
    @Transactional
    public boolean toggleLike(Long sampleIdx, String currentProviderId) {
        PokeSampleEntity sample = pokeSampleRepository.findById(sampleIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 샘플입니다."));

        MemberEntity member = memberRepository.findByProviderId(currentProviderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (likeRepository.existsByPokeSampleAndMemberIdx(sample, member.getIdx())) {
            likeRepository.deleteByPokeSampleAndMemberIdx(sample, member.getIdx());
            sample.decreaseLikeCount();
            return false;
        } else {
            PokeSampleLikeEntity like = PokeSampleLikeEntity.builder()
                    .pokeSample(sample)
                    .memberIdx(member.getIdx())
                    .build();
            likeRepository.save(like);
            sample.increaseLikeCount();
            return true;
        }
    }
}