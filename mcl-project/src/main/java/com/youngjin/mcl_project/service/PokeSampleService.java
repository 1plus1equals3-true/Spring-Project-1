package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.PokeSampleRequestDTO;
import com.youngjin.mcl_project.dto.PokeSampleResponseDTO;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.entity.PokeSampleLikeEntity;
import com.youngjin.mcl_project.enums.Visibility;
import com.youngjin.mcl_project.repository.MemberRepository;
import com.youngjin.mcl_project.repository.PokeSampleCommentRepository;
import com.youngjin.mcl_project.repository.PokeSampleLikeRepository;
import com.youngjin.mcl_project.repository.PokeSampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PokeSampleService {

    private final PokeSampleRepository pokeSampleRepository;
    private final MemberRepository memberRepository;
    private final PokeSampleLikeRepository likeRepository;
    private final PokeSampleCommentRepository commentRepository;

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
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않습니다. idx=" + idx));

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
        long commentCount = commentRepository.countByPokeSampleIdxAndIsDeletedFalse(entity.getIdx());

        return PokeSampleResponseDTO.fromEntity(entity, nickname, isLiked, isMine, commentCount);
    }

    // 3. 통합 목록 조회 (PUBLIC만 조회)
    public Page<PokeSampleResponseDTO> getSamples(Integer pokemonIdx, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PokeSampleEntity> entityPage;

        if (pokemonIdx != null) {
            entityPage = pokeSampleRepository.findByPokemonIdxAndIsDeletedFalseAndVisibilityOrderByRegdateDesc(
                    pokemonIdx, Visibility.PUBLIC, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            entityPage = pokeSampleRepository.findByPokemonNameContainingAndIsDeletedFalseAndVisibilityOrderByRegdateDesc(
                    keyword, Visibility.PUBLIC, pageable);
        } else {
            entityPage = pokeSampleRepository.findAllByIsDeletedFalseAndVisibilityOrderByRegdateDesc(
                    Visibility.PUBLIC, pageable);
        }

        return entityPage.map(entity -> {
            String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx()).orElse("알 수 없음");

            long commentCount = commentRepository.countByPokeSampleIdxAndIsDeletedFalse(entity.getIdx());

            return PokeSampleResponseDTO.fromEntity(entity, nickname, false, false, commentCount);
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

    // 7. 내 샘플 목록 조회 (PRIVATE 포함)
    public Page<PokeSampleResponseDTO> getMySamples(long memberIdx, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PokeSampleEntity> entityPage = pokeSampleRepository.findByMemberIdxAndIsDeletedFalseOrderByRegdateDesc(
                memberIdx, pageable);

        return entityPage.map(entity -> {
            String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx()).orElse("나");

            long commentCount = commentRepository.countByPokeSampleIdxAndIsDeletedFalse(entity.getIdx());

            return PokeSampleResponseDTO.fromEntity(entity, nickname, false, true, commentCount);
        });
    }

    // 8. 내가 좋아요한 샘플 목록 조회
    public Page<PokeSampleResponseDTO> getLikedSamples(long memberIdx, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PokeSampleLikeEntity> likePage = likeRepository.findByMemberIdxOrderByRegdateDesc(memberIdx, pageable);

        return likePage.map(like -> {
            PokeSampleEntity sample = like.getPokeSample();
            String nickname = memberRepository.findNicknameByIdx(sample.getMemberIdx()).orElse("알 수 없음");
            boolean isMine = sample.getMemberIdx().equals(memberIdx);

            long commentCount = commentRepository.countByPokeSampleIdxAndIsDeletedFalse(sample.getIdx());

            return PokeSampleResponseDTO.fromEntity(sample, nickname, true, isMine, commentCount);
        });
    }

    // 9. 인기 샘플 조회 (기간별)
    public List<PokeSampleResponseDTO> getBestSamples(String period) {
        LocalDateTime startDate;

        // 기간 설정 로직
        switch (period.toUpperCase()) {
            case "DAILY":
                startDate = LocalDateTime.now().minusDays(1); // 최근 24시간
                break;
            case "MONTHLY":
                startDate = LocalDateTime.now().minusMonths(1); // 최근 1달
                break;
            case "ALL":
                startDate = LocalDateTime.of(2000, 1, 1, 0, 0); // 전체 (사실상 모든 기간)
                break;
            case "WEEKLY":
            default:
                startDate = LocalDateTime.now().minusWeeks(1); // 기본: 최근 1주일
                break;
        }

        // 2. 좋아요 테이블에서 상위 3개 ID 조회
        Pageable top3 = PageRequest.of(0, 3);
        List<Long> topSampleIds = likeRepository.findTopSampleIdsByDateAfter(startDate, top3);

        // 3. ID 리스트로 샘플 엔티티 조회
        List<PokeSampleResponseDTO> bestSamples = new ArrayList<>();

        for (Long id : topSampleIds) {
            pokeSampleRepository.findByIdxAndIsDeletedFalse(id).ifPresent(entity -> {
                if (entity.getVisibility() == Visibility.PUBLIC) {
                    String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx()).orElse("알 수 없음");
                    long commentCount = commentRepository.countByPokeSampleIdxAndIsDeletedFalse(entity.getIdx());
                    bestSamples.add(PokeSampleResponseDTO.fromEntity(entity, nickname, false, false, commentCount));
                }
            });
        }

        // 4. 만약 기간 내 데이터가 부족하면? -> 전체 기간 베스트로 채우기 (Fallback)
        if (bestSamples.size() < 3) {
            List<PokeSampleEntity> fallback = pokeSampleRepository.findTop3ByIsDeletedFalseAndVisibilityOrderByLikeCountDesc(Visibility.PUBLIC);
            for (PokeSampleEntity entity : fallback) {
                if (bestSamples.size() >= 3) break;
                // 중복 방지
                boolean exists = bestSamples.stream().anyMatch(dto -> dto.getIdx().equals(entity.getIdx()));
                if (!exists) {
                    String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx()).orElse("알 수 없음");
                    long commentCount = commentRepository.countByPokeSampleIdxAndIsDeletedFalse(entity.getIdx());
                    bestSamples.add(PokeSampleResponseDTO.fromEntity(entity, nickname, false, false, commentCount));
                }
            }
        }

        return bestSamples;
    }
}