package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.AuthUserResponse;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload.base-dir}")
    private String BASE_DIR;

    @Value("${file.upload.profile-dir}")
    private String PROFILE_DIR;

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
     * Provider ID를 기반으로 MemberEntity의 PK(idx)를 조회합니다.
     */
    @Transactional(readOnly = true)
    public long getMemberIdxByProviderId(String providerId) {
        return memberRepository.findByProviderId(providerId)
                .map(MemberEntity::getIdx) // 엔티티에서 idx만 추출
                .orElseThrow(() -> new IllegalArgumentException("ProviderId에 해당하는 회원을 찾을 수 없습니다: " + providerId));
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

        member.updateRefreshToken(refreshToken);
    }

    /**
     * ProviderId를 기반으로 사용자 정보(닉네임, 등급 등)를 조회하여 DTO로 반환 (/me)
     */
    public AuthUserResponse getUserInfo(String providerId) {
        Optional<MemberEntity> memberOptional = memberRepository.findByProviderId(providerId);

        if (memberOptional.isEmpty()) {
            throw new RuntimeException("User not found with providerId: " + providerId);
        }

        MemberEntity member = memberOptional.get();

        // DTO를 생성하여 반환
        return AuthUserResponse.builder()
                .nickname(member.getNickname())
                .grade(member.getGrade())
                .profileImageUrl(member.getFile())
                .birth(member.getBirth())
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<MemberEntity> findByRefreshToken(String refreshToken) {
        return memberRepository.findByRefreshToken(refreshToken);
    }

    // MemberEntity를 찾는 헬퍼 메서드 (예외 처리)
    private MemberEntity findMemberByIdx(long memberIdx) {
        return memberRepository.findById(memberIdx)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. (idx: " + memberIdx + ")"));
    }

    /**
     * 1. 닉네임 수정
     */
    @Transactional
    public void updateNickname(long memberIdx, String newNickname) {
        // 1. 닉네임 중복 확인
        if (memberRepository.findByNickname(newNickname).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 2. 엔티티 업데이트
        MemberEntity member = findMemberByIdx(memberIdx);
        member.updateNickname(newNickname);
    }

    /**
     * 2. 생일 수정
     */
    @Transactional
    public void updateBirth(long memberIdx, LocalDate newBirth) {
        MemberEntity member = findMemberByIdx(memberIdx);
        member.updateBirth(newBirth);
    }

    /**
     * 3. 비밀번호 수정
     */
    @Transactional
    public void updatePassword(long memberIdx, String currentPassword, String newPassword) {
        MemberEntity member = findMemberByIdx(memberIdx);

        // 1. 현재 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(currentPassword, member.getPwd())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 2. 새 비밀번호 암호화 후 업데이트
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        member.updatePassword(encodedNewPassword);
    }

    /**
     * 4. 프로필 이미지 수정 (기존 파일 삭제 로직 포함)
     */
    @Transactional
    public void updateProfileImage(long memberIdx, MultipartFile file) {
        MemberEntity member = findMemberByIdx(memberIdx);
        String oldFileUrl = member.getFile();

        // 1. 새로운 파일 저장
        String newFileUrl = saveProfileImage(file);

        // 2. DB 업데이트
        member.updateFile(newFileUrl);

        // 3. 기존 파일 삭제 (새로운 파일을 DB에 성공적으로 갱신한 후 실행)
        if (oldFileUrl != null && !oldFileUrl.isEmpty()) {
            deleteProfileImage(oldFileUrl);
        }
    }


    // ====================================================================
    // 파일 관련 헬퍼 메서드 (AuthService에서 재활용)
    // ====================================================================

    /**
     * 프로필 이미지를 D:\data\MCL\profile\{YYYYMMDD}\ 경로에 저장하고 DB에 저장할 URL을 반환합니다.
     */
    private String saveProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null; // 파일이 없으면 null 반환
        }

        // (AuthService에 있는 saveProfileImage 메서드와 같은 내용 - 나중에 따로 서비스로 처리)
        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            Path rootPath = Paths.get(BASE_DIR + PROFILE_DIR);
            Path uploadPath = rootPath.resolve(today);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String savedFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(savedFilename);

            Files.copy(file.getInputStream(), filePath);

            // DB 저장 URL 반환: /MCL/profile/YYYYMMDD/uuid.jpg
            return PROFILE_DIR + today + "/" + savedFilename;

        } catch (IOException e) {
            log.error("프로필 이미지 저장 실패", e);
            throw new RuntimeException("프로필 이미지 저장에 실패했습니다.", e);
        }
    }

    /**
     * DB에 저장된 URL을 바탕으로 실제 파일을 디스크에서 제거합니다.
     */
    private void deleteProfileImage(String fileUrl) {
        try {
            // 파일 URL이 BASE_DIR로 시작하는지 확인 (보안 및 경로 유효성)
            if (!fileUrl.startsWith(PROFILE_DIR)) {
                log.warn("안전하지 않은 파일 삭제 시도: {}", fileUrl);
                return;
            }

            Path fullPath = Paths.get(BASE_DIR).resolve(fileUrl);

            if (Files.exists(fullPath)) {
                Files.delete(fullPath);
                log.info("기존 프로필 이미지 삭제 성공: {}", fullPath);
            } else {
                log.warn("삭제하려던 기존 파일이 존재하지 않습니다: {}", fullPath);
            }

        } catch (IOException e) {
            log.error("프로필 이미지 삭제 실패: {}", fileUrl, e);
            // 파일 삭제 실패는 사용자 수정 프로세스를 막을 정도로 심각한 오류는 아닐 수 있으므로
            // RuntimeException을 throw하지 않고 로그만 남길 수 있습니다.
        }
    }
}