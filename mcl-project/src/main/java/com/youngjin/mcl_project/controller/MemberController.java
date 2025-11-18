package com.youngjin.mcl_project.controller;

import com.youngjin.mcl_project.dto.UpdateBirthRequest;
import com.youngjin.mcl_project.dto.UpdateNicknameRequest;
import com.youngjin.mcl_project.dto.UpdatePasswordRequest;
import com.youngjin.mcl_project.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.userdetails.User;

@Slf4j
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * @AuthenticationPrincipal User 객체에서 providerId를 추출하여 DB의 Primary Key(idx)를 조회합니다.
     */
    private long getCurrentMemberIdx(@AuthenticationPrincipal User principal) {
        // principal.getUsername()에는 TokenProvider에서 설정한 providerId가 담겨있습니다.
        String providerId = principal.getUsername();

        // Service를 통해 providerId로 MemberEntity의 idx를 조회
        return memberService.getMemberIdxByProviderId(providerId);
    }

    // 1. 프로필 이미지 수정 (Multipart 요청)
    @PatchMapping("/update/profile-image")
    public ResponseEntity<Void> updateProfileImage(
            @RequestPart("profileImage") MultipartFile file,
            @AuthenticationPrincipal User principal
    ) {
        long memberIdx = getCurrentMemberIdx(principal);
        memberService.updateProfileImage(memberIdx, file);
        return ResponseEntity.ok().build(); // 200 OK, 응답 본문 없음
    }

    // 2. 닉네임 수정 (JSON 요청)
    @PatchMapping("/update/nickname")
    public ResponseEntity<Void> updateNickname(
            @Valid @RequestBody UpdateNicknameRequest request, // DTO 유효성 검사
            @AuthenticationPrincipal User principal
    ) {
        long memberIdx = getCurrentMemberIdx(principal);
        // ⭐ 수정: request.nickname() 대신 request.getNickname() 사용
        memberService.updateNickname(memberIdx, request.getNickname());
        return ResponseEntity.ok().build(); // 200 OK
    }

    // 3. 생일 수정 (JSON 요청)
    @PatchMapping("/update/birth")
    public ResponseEntity<Void> updateBirth(
            @Valid @RequestBody UpdateBirthRequest request,
            @AuthenticationPrincipal User principal
    ) {
        long memberIdx = getCurrentMemberIdx(principal);
        // ⭐ 수정: request.birth() 대신 request.getBirth() 사용
        memberService.updateBirth(memberIdx, request.getBirth());
        return ResponseEntity.ok().build(); // 200 OK
    }

    // 4. 비밀번호 수정 (JSON 요청)
    @PatchMapping("/update/password")
    public ResponseEntity<Void> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            @AuthenticationPrincipal User principal
    ) {
        long memberIdx = getCurrentMemberIdx(principal);
        memberService.updatePassword(
                memberIdx,
                // ⭐ 수정: request.currentPassword() 대신 request.getCurrentPassword() 사용
                request.getCurrentPassword(),
                // ⭐ 수정: request.newPassword() 대신 request.getNewPassword() 사용
                request.getNewPassword()
        );
        return ResponseEntity.ok().build(); // 200 OK
    }
}