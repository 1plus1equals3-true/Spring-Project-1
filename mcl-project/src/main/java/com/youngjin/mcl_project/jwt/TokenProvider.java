package com.youngjin.mcl_project.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User; // Spring Security User 객체
import io.jsonwebtoken.Jwts;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class TokenProvider {

    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private final long refreshValidityInSeconds;

    // 생성자를 통해 모든 값을 @Value로 주입받도록 강제
    public TokenProvider(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.access-token-validity-in-seconds:1800}") long accessValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-days:7}") long refreshValidityInDays
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);

        // Access Token (초를 밀리초로)
        this.accessTokenValidityInMilliseconds = accessValidityInSeconds * 1000L;

        // Refresh Token (일을 초로 변환한 후 밀리초로)
        this.refreshValidityInSeconds = refreshValidityInDays * 24 * 60 * 60; // 7일 * 24시간 * 60분 * 60초
        this.refreshTokenValidityInMilliseconds = this.refreshValidityInSeconds * 1000L;

        // 최종적으로 계산된 값 로그 출력
        log.info("Refresh Token Validity: {} seconds", this.refreshValidityInSeconds);
    }

    /**
     * Access Token 생성: Provider ID와 사용자 등급(grade) 기반
     */
    public String createAccessToken(String providerId, long grade) {
        String role = getRoleFromGrade(grade); // 등급으로 권한 부여
        long now = (new Date()).getTime();
        Date validity = new Date(now + this.accessTokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(providerId)
                .claim("role", role)
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(validity)
                .compact();
    }

    /**
     * Refresh Token 생성: Provider ID 기반 (만료 시간만 길게)
     */
    public String createRefreshToken(String providerId) {
        long now = (new Date()).getTime();
        Date validity = new Date(now + this.refreshTokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(providerId)
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(validity)
                .compact();
    }

    // 토큰에서 Subject (providerId)만 추출하는 메서드
    public String getSubject(String token) {
        try {
            return Jwts.parser().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
        } catch (Exception e) {
            // 파싱 실패 또는 만료 시 null 반환 또는 예외 처리
            return null;
        }
    }

    // 등급에 따라 권한 문자열을 반환하는 헬퍼 메서드
    private String getRoleFromGrade(long grade) {
        // 등급: 1 = 일반, 9 = 관리자
        if (grade >= 9) {
            return "ROLE_ADMIN,ROLE_USER"; // 관리자
        }
        return "ROLE_USER"; // 일반 유저
    }

    // 토큰에서 인증 정보를 추출하는 메서드
    public Authentication getAuthentication(String token) {
        // 1. 토큰에서 클레임(claims) 정보 추출
        Claims claims = Jwts
                .parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // 2. 클레임에서 권한 정보(role)를 추출하여 GrantedAuthority 컬렉션 생성
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("role").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        // 3. Spring Security의 UserDetails 객체(여기서는 User) 생성
        // Subject (providerId)와 권한을 사용
        User principal = new User(claims.getSubject(), "", authorities);

        // 4. Authentication 객체 반환
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    // 토큰의 유효성 검증 (서명 및 만료 시간)
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    public long getAccessTokenValidityInSeconds() {
        return this.accessTokenValidityInMilliseconds / 1000;
    }

    public long getRefreshTokenValidityInSeconds() {
        return this.refreshValidityInSeconds;
    }
}