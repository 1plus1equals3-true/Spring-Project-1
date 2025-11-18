package com.youngjin.mcl_project.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateBirthRequest {

    // 3. 생일
    private LocalDate birth;

}
