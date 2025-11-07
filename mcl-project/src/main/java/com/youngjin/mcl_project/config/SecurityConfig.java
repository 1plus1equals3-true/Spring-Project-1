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


    // ⭐️ 하나만 남긴 CORS Configuration Source 빈
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ⭐️ React 개발 서버 HTTPS 주소 허용 (쿠키 전송 허용)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "https://localhost:5173"
        ));

        // ⭐️ 쿠키 및 인증 정보 교환 허용 (이것이 401 오류 해결의 핵심)
        configuration.setAllowCredentials(true);

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}