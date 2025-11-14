package com.youngjin.mcl_project.dto;

import com.youngjin.mcl_project.entity.MemberEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    @Pattern(regexp = "^[a-zA-Z0-9]{5,15}$",
            message = "아이디는 영문/숫자 5~15자리여야 합니다.")
    private String userid;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Pattern(regexp = "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\\W)(?=\\S+$).{8,20}",
            message = "비밀번호는 8~20자이며, 영문, 숫자, 특수문자를 포함해야 합니다.")
    private String pwd;

    @NotBlank(message = "닉네임은 필수 입력 값입니다.")
    @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$",
            message = "닉네임은 2자 이상 10자 이하이며, 한글, 영문, 숫자만 사용할 수 있습니다.")
    private String nickname;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birth;

    // 파일 업로드
    private MultipartFile profileImage;

    // DTO를 Entity로 변환하는 헬퍼 메서드
    public MemberEntity toEntity(String encryptedPwd, String profileFileUrl) {
        return MemberEntity.builder()
                .userid(this.userid)
                .pwd(encryptedPwd) // 암호화된 비밀번호 저장
                .nickname(this.nickname)
                .birth(this.birth)
                .file(profileFileUrl) // 절대 경로 제외한 경로
                .grade(1L) // 기본 등급
                .provider("LOCAL") // 자체 회원가입은 "LOCAL"
                .providerId(this.userid)
                .regdate(java.time.LocalDateTime.now())
                .build();
    }
}