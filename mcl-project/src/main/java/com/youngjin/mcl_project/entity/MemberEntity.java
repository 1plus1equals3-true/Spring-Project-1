package com.youngjin.mcl_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "member")
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idx;

    private String userid;

    private String pwd;

    private String nickname;

    private LocalDate birth;

    private String file;

    private long grade;

    private LocalDateTime regdate;

    private String provider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "refresh_token")
    private String refreshToken;

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    @Builder
    public MemberEntity(String nickname, String provider, String providerId) {
        this.nickname = nickname;
        this.provider = provider;
        this.providerId = providerId;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateBirth(LocalDate birth) {
        this.birth = birth;
    }

    public void updateFile(String fileUrl) {
        this.file = fileUrl;
    }

    // 비밀번호는 암호화된 상태로 전달받아야 합니다.
    public void updatePassword(String encodedNewPassword) {
        this.pwd = encodedNewPassword;
    }
}
