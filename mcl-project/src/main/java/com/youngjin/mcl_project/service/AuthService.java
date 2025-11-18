package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.LoginRequest;
import com.youngjin.mcl_project.dto.SignupRequest;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberService memberService;

    @Value("${file.upload.base-dir}")
    private String BASE_DIR;

    @Value("${file.upload.profile-dir}")
    private String PROFILE_DIR;

    /**
     * 자체 회원가입 처리 및 파일 저장
     */
    @Transactional
    public MemberEntity registerMember(SignupRequest request) {

        // 1. 아이디 닉네임 중복 확인
        if (memberRepository.findByUserid(request.getUserid()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다: " + request.getUserid());
        }

        if (memberRepository.findByNickname(request.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다: " + request.getNickname());
        }

        // 2. 비밀번호 암호화
        String encryptedPwd = passwordEncoder.encode(request.getPwd());

        // 3. 파일 처리 (프로필 이미지)
        String profileFileUrl = saveProfileImage(request.getProfileImage());

        // 4. Entity 생성 및 저장
        MemberEntity newMember = request.toEntity(encryptedPwd, profileFileUrl);

        return memberRepository.save(newMember);
    }

    // 아이디 중복 확인
    @Transactional(readOnly = true)
    public boolean checkUseridDuplication(String userid) {
        return memberRepository.findByUserid(userid).isPresent();
    }

    // 닉네임 중복 확인
    @Transactional(readOnly = true)
    public boolean checkNicknameDuplication(String nickname) {
        return memberRepository.findByNickname(nickname).isPresent();
    }

    /**
     * 프로필 이미지를 D:\data\MCL\profile\{YYYYMMDD}\ 경로에 저장하고 DB에 저장할 URL을 반환합니다.
     */
    private String saveProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null; // 파일이 없으면 null 반환
        }

        try {
            // 1. 오늘 날짜 폴더 생성 (YYYYMMDD)
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            // 2. 전체 저장 경로: D:/data/MCL/profile/YYYYMMDD/
            Path rootPath = Paths.get(BASE_DIR + PROFILE_DIR); // D:/data/MCL/profile/
            Path uploadPath = rootPath.resolve(today); // D:/data/MCL/profile/YYYYMMDD/

            // 3. 디렉토리가 없으면 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 4. 파일명 생성: UUID + 확장자
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String savedFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(savedFilename);

            // 5. 파일 저장
            Files.copy(file.getInputStream(), filePath);

            // 6. DB 저장 URL 반환: /MCL/profile/YYYYMMDD/uuid.jpg
            // BASE_DIR을 제외한 경로를 클라이언트 접근 URL로 사용합니다.
            return PROFILE_DIR + today + "/" + savedFilename;

        } catch (IOException e) {
            log.error("프로필 이미지 저장 실패", e);
            throw new RuntimeException("프로필 이미지 저장에 실패했습니다.", e);
        }
    }

    /**
     * 로컬 사용자 인증 (자체 로그인) 및 JWT 생성을 위한 MemberEntity 반환
     * @param request 로그인 요청 DTO (아이디, 비밀번호)
     * @return 인증에 성공한 MemberEntity
     * @throws IllegalArgumentException 인증 실패 시 발생
     */
    @Transactional(readOnly = true)
    public MemberEntity authenticateLocalUser(LoginRequest request) {

        String trimmedUserid = request.getUserid().trim();
        String trimmedPwd = request.getPwd().trim(); // 권장하지 않음

        // 아이디로 사용자 조회
        MemberEntity member = memberRepository.findByUserid(trimmedUserid)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));

        // 소셜 로그인 사용자인지 확인 (자체 로그인 방지)
        if (!"LOCAL".equalsIgnoreCase(member.getProvider())) {
            throw new IllegalArgumentException("소셜 계정(" + member.getProvider() + ")으로 가입된 사용자입니다.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPwd(), member.getPwd())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 인증 성공
        return member;
    }
}