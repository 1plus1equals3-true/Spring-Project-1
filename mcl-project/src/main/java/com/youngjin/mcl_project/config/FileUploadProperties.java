package com.youngjin.mcl_project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 파일 업로드 기본 경로를 관리하는 Spring Component.
 * 별도의 Bean으로 관리.
 */
@Component
public class FileUploadProperties {

    // application.properties의 값 주입 받아 넘겨주는 컴포넌트
    @Value("${file.upload.base-dir}")
    private String baseDir;

    // 경로를 외부에 노출하는 getter 메서드
    public String getBaseDir() {
        // 경로 문자열이 항상 '/' 또는 '\'로 끝나도록 보장
        if (!baseDir.endsWith("/") && !baseDir.endsWith("\\")) {
            return baseDir + "/";
        }
        return baseDir;
    }
}