package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.PokeSampleRequestDTO;
import com.youngjin.mcl_project.dto.PokeSampleResponseDTO;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.entity.PokeSample;
import com.youngjin.mcl_project.repository.MemberRepository;
import com.youngjin.mcl_project.repository.PokeSampleLikeRepository;
import com.youngjin.mcl_project.repository.PokeSampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용 (성능 최적화)
public class PokeSampleService {

    private final PokeSampleRepository pokeSampleRepository;
    private final MemberRepository memberRepository;
    private final PokeSampleLikeRepository likeRepository;

    // 1. 등록 (Create)
    @Transactional // 쓰기 작업이므로 readOnly 해제
    public Long createSample(PokeSampleRequestDTO dto) {
        PokeSample entity = dto.toEntity();
        PokeSample saved = pokeSampleRepository.save(entity);
        return saved.getIdx();
    }

    // 2. 상세 조회
    @Transactional // ⭐️ 조회수 증가(Update)가 일어나므로 readOnly 해제
    public PokeSampleResponseDTO getSample(Long idx, String currentProviderId) {

        // 1. 샘플 조회
        PokeSample entity = pokeSampleRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않습니다. idx=" + idx));

        // 2. 조회수 증가 (엔티티 메서드 호출 -> Dirty Checking)
        entity.increaseHit();

        // 3. 작성자 닉네임 조회 (MemberRepository 활용)
        String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx())
                .orElse("알 수 없음");

        // 4. 로그인한 사용자 정보 확인 (좋아요 여부 & 내 글 여부)
        boolean isLiked = false;
        boolean isMine = false;

        if (currentProviderId != null) {
            // ProviderId로 현재 로그인한 멤버 엔티티 조회 (또는 바로 idx 조회)
            MemberEntity currentMember = memberRepository.findByProviderId(currentProviderId)
                    .orElse(null);

            if (currentMember != null) {
                // 좋아요 여부 체크
                isLiked = likeRepository.existsByPokeSampleAndMemberIdx(entity, currentMember.getIdx());
                // 내 글인지 체크
                isMine = entity.getMemberIdx().equals(currentMember.getIdx());
            }
        }

        // 5. DTO 변환 및 반환
        return PokeSampleResponseDTO.fromEntity(entity, nickname, isLiked, isMine);
    }

    // 3. 포켓몬별 리스트 조회 (List)
    public List<PokeSampleResponseDTO> getSamplesByPokemonId(Integer pokemonIdx) {
        return pokeSampleRepository.findByPokemonIdxOrderByRegdateDesc(pokemonIdx)
                .stream()
                .map(entity -> {
                    // 1. 작성자 닉네임 따로 조회 (BoardService와 동일 방식)
                    String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx())
                            .orElse("알 수 없음");

                    // 2. DTO 변환 (리스트 조회시에는 '좋아요 여부'와 '내 글 여부'는 일단 false로 둡니다)
                    // 만약 리스트에서도 하트 색칠이 필요하면 Controller에서 currentUserId를 넘겨받아야 합니다.
                    return PokeSampleResponseDTO.fromEntity(entity, nickname, false, false);
                })
                .collect(Collectors.toList());
    }

    // 4. 수정 (Update)
    @Transactional
    public Long updateSample(Long idx, PokeSampleRequestDTO dto, Long currentMemberIdx) {
        PokeSample entity = pokeSampleRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않습니다."));

        // ⭐️ Long 타입 비교 (Objects.equals 권장)
        if (!entity.getMemberIdx().equals(currentMemberIdx)) {
            throw new IllegalStateException("수정 권한이 없습니다.");
        }

        // 엔티티 수정 (DB 반영됨)
        entity.updateSampleInfo(
                dto.getTeraType(), dto.getItem(), dto.getNature(), dto.getAbility(),
                dto.getIvs(), dto.getEvs(),
                dto.getMove1(), dto.getMove2(), dto.getMove3(), dto.getMove4(),
                dto.getDescription(), dto.getVisibility()
        );

        return entity.getIdx();
    }

    // 5. 삭제 (Delete)
    @Transactional
    public void deleteSample(Long idx, Long currentMemberIdx) {
        PokeSample entity = pokeSampleRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("해당 샘플이 존재하지 않습니다."));

        if (!entity.getMemberIdx().equals(currentMemberIdx)) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }
        pokeSampleRepository.delete(entity);
    }

    // =========================================================
    // 👇 [미구현] 좋아요 & 부가 기능 (나중에 채워넣기)
    // =========================================================

    /**
     * 좋아요 토글 (누르면 켜지고, 다시 누르면 꺼짐)
     * 로직: PokeSampleLike 테이블 조회 -> 있으면 삭제(취소) & 카운트 감소 / 없으면 생성(추가) & 카운트 증가
     */
    @Transactional
    public boolean toggleLike(Long sampleIdx, String memberIdx) {
        // TODO: 1. sampleIdx로 게시글 찾기
        // TODO: 2. LikeRepository에서 memberIdx로 조회
        // TODO: 3-1. 이미 있으면 -> delete & sample.decreaseLikeCount() -> return false (취소됨)
        // TODO: 3-2. 없으면 -> save & sample.increaseLikeCount() -> return true (좋아요됨)
        return false; // 임시 리턴
    }

    /**
     * 사용자가 이 글에 좋아요를 눌렀는지 확인
     */
    public boolean isLiked(Long sampleIdx, String memberIdx) {
        // TODO: LikeRepository.existsBy... 호출
        return false;
    }

    /**
     * 내가 작성한 샘플 모아보기
     */
    public List<PokeSampleResponseDTO> getMySamples(String memberIdx) {
        // TODO: Repository.findByMemberIdxOrderByRegdateDesc 호출
        // TODO: stream map으로 DTO 변환 후 리턴
        return null;
    }
}