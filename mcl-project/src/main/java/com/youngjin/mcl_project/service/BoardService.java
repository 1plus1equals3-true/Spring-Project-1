package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.*;
import com.youngjin.mcl_project.entity.BoardAttachmentsEntity;
import com.youngjin.mcl_project.entity.BoardAttachmentsEntity.FileStatus;
import com.youngjin.mcl_project.entity.BoardEntity;
import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import com.youngjin.mcl_project.entity.MemberEntity;
import com.youngjin.mcl_project.entity.BoardRecommendEntity;
import com.youngjin.mcl_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자 주입을 자동으로 처리
public class BoardService {

    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final BoardCommentRepository commentRepository;
    private final BoardAttachmentsRepository attachmentsRepository;
    private final BoardRecommendRepository boardRecommendRepository;

    @Value("${file.upload.base-dir}")
    private String BASE_DIR;

    @Value("${file.upload.board-dir}")
    private String BOARD_DIR;

    /**
     * 게시글 목록을 조회하고 DTO로 변환하여 반환합니다. (페이징 포함)
     *
     * @param boardType 게시판 유형 (NOTICE/FREE)
     * @param page      요청 페이지 번호 (0부터 시작)
     * @param size      페이지당 게시글 수
     * @return BoardListResponse를 포함하는 Page 객체
     */
    @Transactional(readOnly = true)
    public Page<BoardListResponse> getBoardList(BoardType boardType, int page, int size) {

        // 1. 페이징 및 정렬 설정 (idx 기준 내림차순 정렬)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "idx"));

        // 2. Repository를 통해 DB에서 엔티티 목록 조회
        Page<BoardEntity> entityPage = boardRepository.findAllByBoardTypeAndIsDeletedFalse(boardType, pageable);

        // 3. Entity Page를 DTO Page로 변환
        return entityPage.map(entity -> {

            // 💡 작성자 닉네임 조회
            String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx())
                    .orElse("알 수 없음");

            // 💡 댓글 수 조회
            long commentCount = commentRepository.countByBoardIdx(entity.getIdx());

            return BoardListResponse.builder()
                    .idx(entity.getIdx())
                    .boardType(entity.getBoardType())
                    .title(entity.getTitle())
                    .hit(entity.getHit())
                    .recommend(entity.getRecommend())
                    .regdate(entity.getRegdate())
                    .authorNickname(nickname)
                    .commentCount(commentCount)
                    .build();
        });
    }

    /**
     * 게시글 상세 정보를 조회합니다.
     * @param idx 게시글 ID
     * @param currentProviderId 현재 로그인한 사용자 ID (없으면 null)
     */
    @Transactional
    public BoardDetailResponse getBoardDetail(long idx, String currentProviderId) {

        // 1. 게시글 조회
        BoardEntity entity = boardRepository.findByIdxAndIsDeletedFalse(idx);
        if (entity == null) {
            throw new IllegalArgumentException("존재하지 않거나 삭제된 게시글입니다. ID: " + idx);
        }

        // 2. 조회수 증가
        entity.setHit(entity.getHit() + 1);

        // 3. 닉네임 조회
        String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx())
                .orElse("알 수 없음");

        // 4. 첨부파일 조회
        List<FileAttachmentResponse> attachments = attachmentsRepository
                .findAllByBoardIdxAndStatus(idx, FileStatus.ACTIVE)
                .stream()
                .map(FileAttachmentResponse::fromEntity)
                .toList();

        // ⭐️ 5. [핵심] 내가 추천했는지 확인 로직
        boolean isRecommended = false;

        // 로그인한 사용자라면 DB 확인
        if (currentProviderId != null) {
            // providerId로 멤버 엔티티를 찾고
            MemberEntity member = memberRepository.findByProviderId(currentProviderId).orElse(null);

            // 멤버가 존재하면 추천 여부 확인
            if (member != null) {
                isRecommended = boardRecommendRepository.existsByMemberAndBoard(member, entity);
            }
        }

        return BoardDetailResponse.builder()
                .idx(entity.getIdx())
                .boardType(entity.getBoardType())
                .title(entity.getTitle())
                .content(entity.getContent())
                .hit(entity.getHit())
                .recommend(entity.getRecommend()) // 총 개수
                .regdate(entity.getRegdate())
                .moddate(entity.getModdate())
                .authorNickname(nickname)
                .attachments(attachments)
                .isRecommended(isRecommended) // ⭐️ true/false 전달
                .build();
    }

    /**
     * [이미지 업로드 처리]
     * 에디터에서 이미지를 첨부했을 때 호출됩니다.
     * 파일을 저장하고 'TEMP' 상태의 엔티티를 생성합니다.
     */
    @Transactional
    public BoardImageUploadResponse uploadTempFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        try {
            // 1. 날짜별 폴더 생성 (예: 2025/11/21)
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path uploadPath = Paths.get(BASE_DIR + BOARD_DIR + today);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. 파일명 생성 (UUID 충돌 방지)
            String originalName = file.getOriginalFilename();
            String uuid = UUID.randomUUID().toString();
            String extension = originalName.substring(originalName.lastIndexOf("."));
            String storedName = uuid + extension;

            // 3. 물리적 파일 저장
            Path filePath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), filePath);

            // 4. DB에 파일 정보 저장 (Status: TEMP, BoardIdx: null)
            BoardAttachmentsEntity attachment = BoardAttachmentsEntity.builder()
                    .boardIdx(null) // 아직 게시글과 연결되지 않음
                    .originalName(originalName)
                    .storedName(storedName)
                    .dir(today) // 날짜 경로만 저장 (2025/11/21)
                    .status(FileStatus.TEMP) // ⭐️ 임시 상태
                    .regdate(LocalDateTime.now())
                    .build();

            BoardAttachmentsEntity savedFile = attachmentsRepository.save(attachment);

            // 5. 접근 URL 생성 (/api/images/MCL/board/2025/11/21/uuid.png)
            // WebConfig에서 /api/images/** 를 BASE_DIR로 매핑했으므로 그 뒤 경로만 붙여줌
            String fileUrl = "/api/images/" + BOARD_DIR + today + "/" + storedName;

            return BoardImageUploadResponse.builder()
                    .fileIdx(savedFile.getIdx())
                    .fileUrl(fileUrl)
                    .originalFilename(originalName)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 게시글을 작성하고 임시 파일들을 해당 게시글에 연결합니다.
     *
     * @param request 게시글 작성 요청 DTO
     * @param memberIdx 현재 로그인된 사용자 ID (Security Context 등에서 가져옴)
     * @return 생성된 게시글의 ID (PK)
     */
    @Transactional
    public long createBoard(BoardCreationRequest request, long memberIdx, String ipAddress) {

        // 1. BoardEntity 생성 및 저장
        BoardEntity boardEntity = BoardEntity.builder()
                .memberIdx(memberIdx)
                .boardType(request.getBoardType())
                .title(request.getTitle())
                .content(request.getContent())
                .hit(0)
                .recommend(0)
                .regdate(LocalDateTime.now())
                .ip(ipAddress)
                .isDeleted(false) // 초기에는 삭제되지 않은 상태
                .build();

        BoardEntity savedEntity = boardRepository.save(boardEntity);
        long newBoardIdx = savedEntity.getIdx();

        // 2. 첨부 파일 연결 처리 (핵심 로직)
        List<Long> fileIdxList = request.getFileIdxList();
        if (fileIdxList != null && !fileIdxList.isEmpty()) {
            // 임시 파일들의 상태를 ACTIVE로, boardIdx를 새로 생성된 게시글 ID로 업데이트
            int updatedCount = attachmentsRepository.updateStatusAndBoardIdx(
                    fileIdxList,
                    newBoardIdx,
                    FileStatus.ACTIVE
            );
            System.out.println("게시글 작성 완료 후 연결된 파일 수: " + updatedCount);
        }

        return newBoardIdx;
    }

    /**
     * 게시글을 수정하고 첨부 파일 목록을 갱신합니다.
     *
     * @param request 게시글 수정 요청 DTO
     * @param memberIdx 현재 로그인된 사용자 ID (권한 확인용)
     * @param ipAddress 사용자 IP 주소
     */
    @Transactional
    public void updateBoard(BoardUpdateRequest request, long memberIdx, String ipAddress) {

        // 1. 게시글 존재 및 권한 확인
        BoardEntity entity = boardRepository.findByIdxAndIsDeletedFalse(request.getIdx());

        if (entity == null) {
            throw new IllegalArgumentException("존재하지 않거나 삭제된 게시글입니다. ID: " + request.getIdx());
        }

        // 작성자 본인인지 확인
        if (entity.getMemberIdx() != memberIdx) {
            throw new IllegalArgumentException("게시글 수정 권한이 없습니다.");
        }

        // 2. BoardEntity 수정
        entity.setTitle(request.getTitle());
        entity.setContent(request.getContent());
        entity.setModdate(LocalDateTime.now()); // 수정 시간 업데이트
        entity.setIp(ipAddress); // IP 업데이트 (필요에 따라)
        // boardRepository.save(entity); // Dirty Checking으로 자동 업데이트

        // 3. 첨부 파일 연결 갱신 로직 (핵심 로직)
        long currentBoardIdx = request.getIdx();

        // 3-1. 기존 파일 모두 'TEMP' 상태로 초기화 (현재 게시글에서 파일 연결 해제)
        // 이 로직은 이전 게시글의 모든 ACTIVE 파일을 TEMP로 만들고 boardIdx를 NULL로 만듭니다.
        int resetCount = attachmentsRepository.resetFilesToTemp(currentBoardIdx);
        System.out.println("게시글 수정 전 TEMP로 리셋된 파일 수: " + resetCount);

        // 3-2. 새로 전달된 파일 목록을 'ACTIVE'로 업데이트 및 boardIdx 연결
        // updateStatusAndBoardIdx 메서드는 List의 idx를 가진 파일만 연결하고 ACTIVE로 만듭니다.
        List<Long> newFileIdxList = request.getFileIdxList();
        if (newFileIdxList != null && !newFileIdxList.isEmpty()) {
            int updatedCount = attachmentsRepository.updateStatusAndBoardIdx(
                    newFileIdxList,
                    currentBoardIdx,
                    FileStatus.ACTIVE
            );
            System.out.println("게시글 수정 완료 후 재연결된 파일 수: " + updatedCount);
        }

        // ⭐️ 결과적으로 3-1에서 TEMP가 된 파일 중 3-2에서 ACTIVE로 재연결되지 못한 파일들은
        // 실제 웹 에디터에서 '삭제'된 파일로 간주되며, 추후 스케줄러를 통해 물리적으로 정리됩니다.
    }

    /**
     * 게시글을 소프트 삭제(Soft Delete) 처리합니다.
     * 게시글의 isDeleted 필드를 true로 변경하고,
     * 연결된 댓글과 첨부 파일도 함께 정리(soft delete 및 TEMP 처리)합니다.
     *
     * @param idx 삭제할 게시글 ID
     * @param memberIdx 현재 로그인된 사용자 ID (권한 확인용)
     */
    @Transactional
    public void deleteBoard(long idx, long memberIdx) {

        // 1. 게시글 존재 및 권한 확인
        BoardEntity entity = boardRepository.findByIdxAndIsDeletedFalse(idx);

        if (entity == null) {
            // 이미 삭제되었거나 존재하지 않는 게시글
            throw new IllegalArgumentException("존재하지 않거나 이미 삭제된 게시글입니다. ID: " + idx);
        }

        // 작성자 본인인지 확인
        if (entity.getMemberIdx() != memberIdx) {
            throw new IllegalArgumentException("게시글 삭제 권한이 없습니다.");
        }

        // 2. 게시글 소프트 삭제
        entity.setDeleted(true);
        entity.setModdate(LocalDateTime.now()); // 삭제 시각 기록
        // boardRepository.save(entity); // Dirty Checking으로 자동 업데이트

        // 3. 연결된 댓글 소프트 삭제 (CASCADE DELETE 방지)
        int commentDeleteCount = commentRepository.softDeleteAllByBoardIdx(idx);
        System.out.println("게시글 ID " + idx + "와 함께 소프트 삭제된 댓글 수: " + commentDeleteCount);

        // 4. 연결된 파일 상태 TEMP로 리셋 (물리적 삭제 대기)
        // 파일의 boardIdx를 NULL로, status를 TEMP로 변경하여 스케줄러가 삭제할 수 있도록 합니다.
        int fileResetCount = attachmentsRepository.resetFilesToTemp(idx);
        System.out.println("게시글 ID " + idx + "에서 TEMP로 리셋된 파일 수: " + fileResetCount);

        // 💡 주의: 실제 물리적 파일 삭제는 별도의 스케줄러 서비스에서 TEMP 상태의 파일을 주기적으로 처리해야 합니다.
    }

    @Transactional
    public String toggleRecommendation(Long boardIdx, String providerId) {
        // 1. 게시글 조회
        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 2. 회원 조회 (로그인한 사용자)
        MemberEntity member = memberRepository.findByProviderId(providerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        // 3. 이미 추천했는지 확인
        if (boardRecommendRepository.existsByMemberAndBoard(member, board)) {
            // 3-1. 이미 추천했다면 -> 추천 취소 (삭제)
            BoardRecommendEntity recommend = boardRecommendRepository.findByMemberAndBoard(member, board)
                    .orElseThrow(() -> new IllegalArgumentException("추천 정보를 찾을 수 없습니다."));

            boardRecommendRepository.delete(recommend);
            board.decreaseRecommend(); // 게시글 테이블의 숫자도 줄임

            return "추천이 취소되었습니다.";
        } else {
            // 3-2. 추천하지 않았다면 -> 추천 저장
            BoardRecommendEntity recommend = BoardRecommendEntity.builder()
                    .member(member)
                    .board(board)
                    .build();

            boardRecommendRepository.save(recommend);
            board.increaseRecommend(); // 게시글 테이블의 숫자도 늘림

            return "추천하였습니다.";
        }
    }
}