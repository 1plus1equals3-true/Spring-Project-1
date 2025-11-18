package com.youngjin.mcl_project.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateProfileRequests {

    // 1. 프로필 이미지
    private MultipartFile profileImage;

}