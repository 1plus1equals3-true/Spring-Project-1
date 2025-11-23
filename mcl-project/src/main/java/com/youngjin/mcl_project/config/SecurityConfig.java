package com.youngjin.mcl_project.config;

import com.youngjin.mcl_project.handler.JwtAccessDeniedHandler;
import com.youngjin.mcl_project.handler.JwtAuthenticationEntryPoint;
import com.youngjin.mcl_project.handler.OAuth2SuccessHandler;
import com.youngjin.mcl_project.jwt.JwtAuthenticationFilter;
import com.youngjin.mcl_project.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.http.HttpMethod.OPTIONS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                // ⭐️ CORS 설정 적용
                .cors(Customizer.withDefaults())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // 예외 처리 핸들러 추가
        http.exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
        );

        http.authorizeHttpRequests(authorize -> authorize
                // ⭐️ 보강: OPTIONS 요청은 모든 필터를 무시하고 바로 허용하도록 설정 순서를 조정합니다.
                .requestMatchers(OPTIONS, "/**").permitAll()

                // POST /api/v1/auth/signup (회원가입)
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/signup").permitAll()
                // POST /api/v1/auth/login (로컬 로그인)
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                // GET /api/v1/auth/check-userid (아이디 중복 확인)
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/check-userid").permitAll()
                // GET /api/v1/auth/check-nickname (닉네임 중복 확인)
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/check-nickname").permitAll()
                // 토큰으로 자신의 정보 호출
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated()
                // 토큰 재발급 및 로그아웃 POST 허용
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/reissue").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").permitAll()
                // 모든 게시판 기능 불러오기
                .requestMatchers("/api/v1/board/**").permitAll()
                // 모든 이미지 불러오기
                .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()
                // 에러 페이지 허용
                .requestMatchers("/error").permitAll()
                .requestMatchers(
                        "/",
                        "/api/auth/**",
                        "/oauth2/**",
                        "/login/**"
                ).permitAll()
                .anyRequest().authenticated() // 나머지 인증 필요
        );

        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2SuccessHandler)
        );

        // ⭐️ JWT 필터는 CORS 필터(cors(Customizer.withDefaults())) 뒤에 위치하는 것이 일반적입니다.
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React 개발 서버 HTTPS 주소 허용 (쿠키 전송 허용)
        // ⭐️ List.of를 사용하는 것이 Arrays.asList보다 안전합니다 (immutability).
        configuration.setAllowedOrigins(List.of(
                "http://192.168.0.190:5173",
                "https://192.168.0.190:5173",
                "http://localhost:5173",
                "https://localhost:5173"
        ));

        // 쿠키 및 인증 정보 교환 허용
        configuration.setAllowCredentials(true);

        // ⭐️ List.of 사용
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setMaxAge(3600L);

        // ⭐️ List.of 사용
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie", "X-User-Nickname"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 보안 표준인 BCrypt 알고리즘 사용
        return new BCryptPasswordEncoder();
    }
}