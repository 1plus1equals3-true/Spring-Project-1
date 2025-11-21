package com.youngjin.mcl_project.scheduler;

import com.youngjin.mcl_project.entity.BoardAttachmentsEntity;
import com.youngjin.mcl_project.entity.BoardAttachmentsEntity.FileStatus;
import com.youngjin.mcl_project.repository.BoardAttachmentsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileCleanupScheduler {

    private final BoardAttachmentsRepository attachmentsRepository;

    @Value("${file.upload.base-dir}")
    private String BASE_DIR;

    @Value("${file.upload.board-dir}")
    private String BOARD_DIR;

    /**
     * 임시 파일 정리 스케줄러
     * 설정: 매 30분마다 실행 (cron 표현식 사용)
     * 대상: 상태가 TEMP이면서, 생성된 지 24시간(테스트 시 1시간)이 지난 파일
     */
    // cron = "초 분 시 일 월 요일"
    // "0 */30 * * * *" -> 매시 0분, 30분마다 실행 (30분 간격)
    // "0 0/1 * * * *"  -> 1분마다 실행 (즉시 테스트용)
    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void deleteUnusedFiles() {
        log.info("🗑️ [스케줄러 시작] 임시 파일 삭제 작업 시작...");

        // 1. 삭제 기준 시간 설정
        LocalDateTime threshold = LocalDateTime.now().minusHours(1); // 1시간 지난 파일
        // LocalDateTime threshold = LocalDateTime.now().minusMinutes(1); // ⚡ 테스트용 1분 지난 파일

        // 2. 삭제 대상 파일 조회 (TEMP 상태이고, 기준 시간보다 이전에 생성된 것)
        List<BoardAttachmentsEntity> tempFiles = attachmentsRepository.findAllByStatusAndRegdateBefore(FileStatus.TEMP, threshold);

        if (tempFiles.isEmpty()) {
            log.info("🗑️ 삭제할 임시 파일이 없습니다.");
            return;
        }

        log.info("🗑️ 총 {}개의 임시 파일을 발견했습니다. 삭제를 진행합니다.", tempFiles.size());

        int successCount = 0;

        for (BoardAttachmentsEntity fileEntity : tempFiles) {
            try {
                // 3. 물리적 파일 삭제
                // 경로 조합: D:/data/ + MCL/board/ + 2025/11/21 + / + uuid.png
                Path filePath = Paths.get(BASE_DIR + BOARD_DIR + fileEntity.getDir(), fileEntity.getStoredName());

                // 파일이 존재하면 삭제
                if (Files.deleteIfExists(filePath)) {
                    log.debug("파일 삭제 성공: {}", filePath);
                } else {
                    log.warn("파일이 존재하지 않아 DB만 삭제합니다: {}", filePath);
                }

                // 4. DB 데이터 삭제
                attachmentsRepository.delete(fileEntity);
                successCount++;

            } catch (Exception e) {
                log.error("파일 삭제 중 오류 발생 (ID: {}): {}", fileEntity.getIdx(), e.getMessage());
                // 하나의 파일 삭제 실패가 전체 프로세스를 멈추지 않도록 catch 처리
            }
        }

        log.info("🗑️ [스케줄러 종료] 총 {}개의 임시 파일 정리 완료.", successCount);
    }
}