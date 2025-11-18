package com.youngjin.mcl_project.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateNicknameRequest {

    // 2. 닉네임
    // @NotBlank 대신 @Size와 @Pattern만 사용. (null인 경우 유효성 검사 통과)
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하입니다.")
    @Pattern(regexp = "^[a-zA-Z0-9가-힣]+$", message = "닉네임은 한글, 영어, 숫자만 사용할 수 있습니다.")
    private String nickname;

}
