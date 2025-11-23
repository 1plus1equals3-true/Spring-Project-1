package com.youngjin.mcl_project.controller;

// Spring MVC 및 Core

import com.youngjin.mcl_project.dto.AuthUserResponse;
import com.youngjin.mcl_project.dto.LoginRequest;
import com.youngjin.mcl_project.dto.SignupRequest;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.jwt.TokenProvider;
import com.youngjin.mcl_project.service.AuthService;
import com.youngjin.mcl_project.service.MemberService;
import com.youngjin.mcl_project.util.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TokenProvider tokenProvider;
    private final MemberService memberService; // Refresh Token 처리
    private final AuthService authService; // 자체 로그인/가입 처리


    /**
     * ⭐️ 로컬 로그인 처리 엔드포인트
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        long accessAge = tokenProvider.getAccessTokenValidityInSeconds();
        long refreshAge = tokenProvider.getRefreshTokenValidityInSeconds();

        try {
            // 1. 사용자 인증 (아이디, 비밀번호 확인)
            MemberEntity member = authService.authenticateLocalUser(request);
            String providerId = member.getUserid(); // 자체 로그인은 userid를 JWT subject로 사용
            long userGrade = member.getGrade();

            // 2. JWT 토큰 생성
            String accessToken = tokenProvider.createAccessToken(providerId, userGrade);
            String refreshToken = tokenProvider.createRefreshToken(providerId);

            // 3. Refresh Token을 DB에 저장/업데이트
            member.updateRefreshToken(refreshToken);
            memberService.updateRefreshToken(member.getProviderId(), refreshToken);

            // 4. 쿠키에 토큰 담기
            addCookieHeader(response, "accessToken", accessToken, (int) accessAge);
            addCookieHeader(response, "refreshToken", refreshToken, (int) refreshAge);

            // 5. 닉네임을 응답 헤더나 바디에 담아 전달 (정보 불러오기 방식 전환 - 추후 삭제)
//            String encodedNickname = URLEncoder.encode(member.getNickname(), StandardCharsets.UTF_8.toString());
//            response.setHeader("X-User-Nickname", encodedNickname);

            log.info("로컬 로그인 성공: {}", member.getUserid());
            return ResponseEntity.ok("로그인이 성공적으로 완료되었습니다.");

        } catch (IllegalArgumentException e) {
            // 인증 실패
            log.warn("로컬 로그인 실패: {}", e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED); // 401
        } catch (Exception e) {
            // 서버 오류
            log.error("로컬 로그인 중 서버 오류 발생", e);
            return new ResponseEntity<>("로그인 처리 중 서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR); // 500
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> getMyInfo() {
        // ⭐️ SecurityUtil을 사용하여 현재 로그인된 사용자의 ProviderId (Subject)를 가져옵니다.
        String providerId = SecurityUtil.getCurrentProviderId();

        // ⭐️ MemberService를 통해 DB에서 해당 사용자 정보(Entity)를 조회합니다.
        AuthUserResponse response = memberService.getUserInfo(providerId);

        return ResponseEntity.ok(response);
    }

    // 자체 회원가입 처리 엔드포인트
    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> signup(@Valid @ModelAttribute SignupRequest request) {

        try {
            MemberEntity member = authService.registerMember(request);
            log.info("회원가입 성공: {}", member.getUserid());
            return new ResponseEntity<>("회원가입이 성공적으로 완료되었습니다.", HttpStatus.CREATED); // 201 Created

        } catch (IllegalArgumentException e) {
            log.warn("회원가입 실패 (중복): {}", e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT); // 409 Conflict

        } catch (RuntimeException e) {
            log.error("회원가입 중 서버 오류 발생", e);
            return new ResponseEntity<>("서버 오류로 회원가입에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR); // 500
        }
    }

    /**
     * 아이디 중복 확인 엔드포인트
     */
    @GetMapping("/check-userid")
    public ResponseEntity<Boolean> checkUserid(@RequestParam String userid) {
        // true: 중복됨, false: 사용 가능
        boolean isDuplicated = authService.checkUseridDuplication(userid);
        return ResponseEntity.ok(isDuplicated);
    }

    /**
     * 닉네임 중복 확인 엔드포인트
     */
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam String nickname) {
        // true: 중복됨, false: 사용 가능
        boolean isDuplicated = authService.checkNicknameDuplication(nickname);
        return ResponseEntity.ok(isDuplicated);
    }

    // Refresh Token을 사용하여 새 Access Token을 발급받는 API
    @PostMapping("/reissue")
    public ResponseEntity<?> reissueAccessToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        long accessAge = tokenProvider.getAccessTokenValidityInSeconds();
        long refreshAge = tokenProvider.getRefreshTokenValidityInSeconds();

        if (refreshToken == null) {
            return new ResponseEntity<>("Refresh Token이 없습니다.", HttpStatus.UNAUTHORIZED);
        }

        // 1. Refresh Token 자체의 유효성 검사 (서명, 만료 여부)
        if (!tokenProvider.validateToken(refreshToken)) {
            // 만료되었다면 401 반환 (재로그인 유도)
            return new ResponseEntity<>("만료되거나 잘못된 Refresh Token입니다.", HttpStatus.UNAUTHORIZED);
        }

        // ⭐️ 2. DB에 저장된 Refresh Token과 일치하는지 확인 (가장 중요한 보안 검증)
        // MemberService에서 Refresh Token으로 회원 엔티티를 찾음
        Optional<MemberEntity> memberOptional = memberService.findByRefreshToken(refreshToken);

        if (memberOptional.isEmpty()) {
            // DB에 없으면 유효하지 않은 토큰 (탈취, 이미 재발급되어 폐기된 토큰 등)
            return new ResponseEntity<>("DB에 저장되지 않은 Refresh Token입니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            MemberEntity member = memberOptional.get();
            String providerId = member.getProviderId(); // DB에서 providerId를 가져오는 것이 더 확실

            // 3. 새 Access Token 생성
            long userGrade = member.getGrade(); // DB에서 grade 조회
            String newAccessToken = tokenProvider.createAccessToken(providerId, userGrade);

            // ⭐️ 4. (보안 강화) 새 Refresh Token 발급 및 DB 업데이트 (롤링 방식)
            String newRefreshToken = tokenProvider.createRefreshToken(providerId);
            memberService.updateRefreshToken(providerId, newRefreshToken);

            // 5. 새 Access Token 및 Refresh Token 쿠키에 담아 반환 (기존 쿠키 덮어쓰기)
            addCookieHeader(response, "accessToken", newAccessToken, (int) accessAge);
            addCookieHeader(response, "refreshToken", newRefreshToken, (int) refreshAge); // ⭐️ 새 Refresh Token도 쿠키에 담기

            return ResponseEntity.ok("Access Token이 성공적으로 재발급되었습니다.");

        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생: {}", e.getMessage());
            return new ResponseEntity<>("토큰 재발급 처리 중 서버 오류가 발생했습니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    // 💡 AuthController 내부에 쿠키 생성 헬퍼 메서드 추가 (코드 중복 방지)
    private void addCookieHeader(HttpServletResponse response, String name, String value, int maxAge) {
        String cookieHeader = String.format("%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure",
                name,
                value,
                maxAge);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    /**
     * 로그아웃: Access/Refresh Token 쿠키를 삭제합니다.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Access Token 쿠키 삭제 (만료 시간을 0으로 설정)
        String accessCookieHeader = "accessToken=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure"; // Secure 추가
        response.addHeader("Set-Cookie", accessCookieHeader);

        // Refresh Token 쿠키 삭제 (만료 시간을 0으로 설정)
        String refreshCookieHeader = "refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure"; // Secure 추가
        response.addHeader("Set-Cookie", refreshCookieHeader);

        return ResponseEntity.ok("로그아웃 및 쿠키 삭제 완료");
    }
}