package com.youngjin.mcl_project.config;

import com.youngjin.mcl_project.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import com.youngjin.mcl_project.service.CustomOAuth2UserService;
import com.youngjin.mcl_project.handler.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.Arrays;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                // ⭐️ CORS 설정 Bean 적용 (아래의 corsConfigurationSource Bean 사용)
                .cors(cors -> {})

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.authorizeHttpRequests(authorize -> authorize
                // 인증 없이 접근 가능한 경로 (로그인, 토큰 리다이렉트 경로)
                .requestMatchers(
                        "/",
                        "/api/auth/**",
                        "/oauth2/**",
                        "/login/**",
                        "/oauth/redirect"
                ).permitAll()
                // 나머지 모든 요청은 인증 필요
                .anyRequest().authenticated()
        );

        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2SuccessHandler)
        );

        // ⭐️ JWT 필터를 UsernamePasswordAuthenticationFilter 이전에 추가
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ⭐️ CORS 설정 Bean 정의: React 개발 환경(localhost:3000)을 허용
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        // React 개발 서버 주소 허용 (실제 서비스에서는 도메인으로 변경)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // 모든 HTTP 메서드 허용
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Authorization 헤더 및 Content-Type, X-Requested-With 헤더 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 쿠키 및 인증 정보 교환 허용
        configuration.setAllowCredentials(true);

        // preflight 요청 캐시 시간
        configuration.setMaxAge(3600L);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 대해 CORS 설정 적용
        return source;
    }
}