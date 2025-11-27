package com.youngjin.mcl_project.controller;

import com.youngjin.mcl_project.dto.*;
import com.youngjin.mcl_project.service.BoardService;
import com.youngjin.mcl_project.service.MemberService;
import com.youngjin.mcl_project.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final BoardService boardService;

    private long getCurrentMemberIdx() {
        String providerId;
        try {
            // Security Context에서 ProviderId 추출
            providerId = SecurityUtil.getCurrentProviderId();
        } catch (RuntimeException e) {
            log.warn("Security Context 인증 정보 없음: {}", e.getMessage());
            return 0L;
        }

        if ("anonymousUser".equals(providerId)) {
            log.warn("비로그인 사용자 접근");
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

    // 1. 프로필 이미지 수정
    @PatchMapping("/update/profile-image")
    public ResponseEntity<Void> updateProfileImage(
            @RequestPart("profileImage") MultipartFile file
            // ⭐️ @AuthenticationPrincipal 제거
    ) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        memberService.updateProfileImage(memberIdx, file);
        return ResponseEntity.ok().build();
    }

    // 2. 닉네임 수정
    @PatchMapping("/update/nickname")
    public ResponseEntity<Void> updateNickname(@Valid @RequestBody UpdateNicknameRequest request) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        memberService.updateNickname(memberIdx, request.getNickname());
        return ResponseEntity.ok().build();
    }

    // 3. 생일 수정
    @PatchMapping("/update/birth")
    public ResponseEntity<Void> updateBirth(@Valid @RequestBody UpdateBirthRequest request) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        memberService.updateBirth(memberIdx, request.getBirth());
        return ResponseEntity.ok().build();
    }

    // 4. 비밀번호 수정
    @PatchMapping("/update/password")
    public ResponseEntity<Void> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        memberService.updatePassword(
                memberIdx,
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok().build();
    }

    // 최근 게시글 조회 (3개)
    @GetMapping("/me/recent-boards")
    public ResponseEntity<List<BoardListResponse>> getMyRecentBoards() {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(boardService.getMyRecentBoards(memberIdx, 3));
    }

    // 최근 댓글 조회 (3개)
    @GetMapping("/me/recent-comments")
    public ResponseEntity<List<BoardCommentResponse>> getMyRecentComments() {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(boardService.getMyRecentComments(memberIdx, 3));
    }

    // 내 게시글 전체 목록 (페이징)
    // GET /api/v1/members/me/boards?page=0&size=10
    @GetMapping("/me/boards")
    public ResponseEntity<Page<BoardListResponse>> getMyBoards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(boardService.getMyBoards(memberIdx, page, size));
    }

    // 내 댓글 전체 목록 (페이징)
    // GET /api/v1/members/me/comments?page=0&size=10
    @GetMapping("/me/comments")
    public ResponseEntity<Page<BoardCommentResponse>> getMyComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(boardService.getMyComments(memberIdx, page, size));
    }
}