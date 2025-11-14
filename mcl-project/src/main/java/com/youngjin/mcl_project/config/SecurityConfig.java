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

import java.util.Arrays;

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

    // ⭐️ CORS 설정 빈을 주입받습니다.
    private final CorsConfigurationSource corsConfigurationSource; // ⭐️ 유지

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                // ⭐️ 수정: 주입받은 CorsConfigurationSource를 명시적으로 적용합니다.
                .cors(Customizer.withDefaults()) // ⭐️ 수정 완료

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // 예외 처리 핸들러 추가
        http.exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
        );

        http.authorizeHttpRequests(authorize -> authorize
                .requestMatchers(OPTIONS, "/**").permitAll() // OPTIONS 허용
                // POST /api/v1/auth/signup (회원가입)
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/signup").permitAll()
                // POST /api/v1/auth/login (로컬 로그인)
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                // GET /api/v1/auth/check-userid (아이디 중복 확인)
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/check-userid").permitAll()
                // GET /api/v1/auth/check-nickname (닉네임 중복 확인)
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/check-nickname").permitAll()
                // (토큰으로 자기 정보 호출)
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/me").permitAll()
                // 토큰 재발급 및 로그아웃 POST 허용
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/reissue").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").permitAll()
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

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React 개발 서버 HTTPS 주소 허용 (쿠키 전송 허용)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://192.168.0.190:5173",
                "https://192.168.0.190:5173",
                "http://localhost:5173",
                "https://localhost:5173"
        ));

        // 쿠키 및 인증 정보 교환 허용
        configuration.setAllowCredentials(true);

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setMaxAge(3600L);

        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie", "X-User-Nickname"));

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