package com.youngjin.mcl_project.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdatePasswordRequest {

    // 4. 현재 비밀번호 (비밀번호 변경 시에만 필요)
    private String currentPassword;

    // 5. 새 비밀번호 (비밀번호 변경 시에만 필요)
    @Pattern(regexp = "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\\W)(?=\\S+$).{8,20}",
            message = "비밀번호는 8~20자이며, 영문, 숫자, 특수문자를 포함해야 합니다.")
    private String newPassword;

    // 참고: newPassword가 제공되었을 때 currentPassword가 필수인지 확인하는 로직(교차 필드 검증)은
    // DTO 레벨의 커스텀 애너테이션(@PasswordMatch 등)을 만들거나
    // 서비스 계층에서 처리하는 것이 일반적입니다.

}
