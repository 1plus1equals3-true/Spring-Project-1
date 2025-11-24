package com.youngjin.mcl_project.controller;

import com.youngjin.mcl_project.dto.PokeSampleRequestDTO;
import com.youngjin.mcl_project.dto.PokeSampleResponseDTO;
import com.youngjin.mcl_project.service.MemberService;
import com.youngjin.mcl_project.service.PokeSampleService;
import com.youngjin.mcl_project.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/poke-sample")
@RequiredArgsConstructor
public class PokeSampleController {

    private final PokeSampleService pokeSampleService;
    private final MemberService memberService;

    // BoardController와 동일한 로직
    private long getCurrentMemberIdx() {
        String providerId;
        try {
            providerId = SecurityUtil.getCurrentProviderId();
        } catch (RuntimeException e) {
            log.warn("Security Context 인증 정보 없음: {}", e.getMessage());
            return 0L;
        }

        if ("anonymousUser".equals(providerId)) {
            return 0L;
        }

        try {
            // DB에서 idx 조회
            return memberService.getMemberIdxByProviderId(providerId);
        } catch (IllegalArgumentException e) {
            log.error("유효하지 않은 사용자: {}", providerId);
            throw new RuntimeException("유효하지 않은 사용자 정보입니다.", e);
        }
    }

    // --- 조회 API ---

    @GetMapping("/list")
    public ResponseEntity<Page<PokeSampleResponseDTO>> getSamples(
            @RequestParam(required = false) Integer pokemonIdx,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page, // 기본 0페이지
            @RequestParam(defaultValue = "12") int size // 한 번에 12개씩 (그리드에 맞게)
    ) {
        Page<PokeSampleResponseDTO> result = pokeSampleService.getSamples(pokemonIdx, keyword, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * 샘플 상세 조회
     * GET /api/v1/poke-sample/{idx}
     */
    @GetMapping("/{idx}")
    public ResponseEntity<PokeSampleResponseDTO> getSampleDetail(@PathVariable Long idx) {
        log.info("샘플 상세 조회 요청: Sample ID={}", idx);

        // 1. 현재 로그인한 사용자 ID(ProviderId) 가져오기 (없으면 null)
        String currentProviderId = SecurityUtil.getCurrentProviderId();
        if ("anonymousUser".equals(currentProviderId)) {
            currentProviderId = null;
        }

        try {
            // 2. 서비스 호출 (providerId 전달)
            PokeSampleResponseDTO response = pokeSampleService.getSample(idx, currentProviderId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("샘플 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // --- 작성/수정/삭제 API ---

    @PostMapping
    public ResponseEntity<Long> createSample(@RequestBody PokeSampleRequestDTO request) {
        long memberIdx = getCurrentMemberIdx();

        // 1. 비로그인(0L) 차단
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. DTO에 작성자 idx 주입
        request.setMemberIdx(memberIdx);

        log.info("샘플 작성 요청: MemberIdx={}, Pokemon={}", memberIdx, request.getPokemonName());

        try {
            Long newIdx = pokeSampleService.createSample(request);
            return new ResponseEntity<>(newIdx, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("샘플 작성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{idx}")
    public ResponseEntity<String> updateSample(@PathVariable Long idx, @RequestBody PokeSampleRequestDTO request) {
        long memberIdx = getCurrentMemberIdx();

        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            // Service에 수정 요청 (검증 포함)
            pokeSampleService.updateSample(idx, request, memberIdx);
            return ResponseEntity.ok("수정되었습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage()); // 권한 없음
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("존재하지 않는 샘플입니다.");
        } catch (Exception e) {
            log.error("수정 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }

    @DeleteMapping("/{idx}")
    public ResponseEntity<String> deleteSample(@PathVariable Long idx) {
        long memberIdx = getCurrentMemberIdx();

        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            pokeSampleService.deleteSample(idx, memberIdx);
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("이미 삭제된 샘플입니다.");
        } catch (Exception e) {
            log.error("삭제 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }

    /**
     * 좋아요 토글
     * POST /api/v1/poke/like/{idx}
     */
    @PostMapping("/like/{idx}")
    public ResponseEntity<Boolean> toggleLike(@PathVariable Long idx) {
        String providerId = SecurityUtil.getCurrentProviderId();

        if ("anonymousUser".equals(providerId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // true(켜짐) 또는 false(꺼짐) 반환
            boolean result = pokeSampleService.toggleLike(idx, providerId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("좋아요 처리 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}