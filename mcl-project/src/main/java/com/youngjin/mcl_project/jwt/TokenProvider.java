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
    // 토큰 유효 기간: 24시간 (1000ms * 60초 * 60분 * 24시간)
    private final long tokenValidityInMilliseconds = 1000L * 60 * 60 * 24;

    public TokenProvider(@Value("${jwt.secret}") String secretKey) {
        // application.yml에서 주입받은 secret key를 Base64 디코딩하여 Key 객체 생성
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Provider ID와 권한 정보를 기반으로 Access Token을 생성합니다.
     * @param providerId 소셜 서비스에서 제공하는 사용자 고유 ID (식별 키)
     * @param role 사용자 권한 (예: ROLE_USER)
     * @return 생성된 JWT 문자열
     */
    public String createToken(String providerId, String role) {
        long now = (new Date()).getTime();
        Date validity = new Date(now + this.tokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(providerId) // 토큰 주체: providerId 사용
                .claim("role", role)     // 페이로드에 권한 정보 포함
                .signWith(key, SignatureAlgorithm.HS512) // HMAC SHA-512 서명
                .setExpiration(validity) // 만료 시간
                .compact();
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
}