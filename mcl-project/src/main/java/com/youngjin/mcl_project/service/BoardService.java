package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.BoardCreationRequest;
import com.youngjin.mcl_project.dto.BoardDetailResponse;
import com.youngjin.mcl_project.dto.BoardListResponse;
import com.youngjin.mcl_project.dto.BoardUpdateRequest;
import com.youngjin.mcl_project.entity.BoardAttachmentsEntity.FileStatus;
import com.youngjin.mcl_project.entity.BoardEntity;
import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import com.youngjin.mcl_project.repository.BoardAttachmentsRepository;
import com.youngjin.mcl_project.repository.BoardCommentRepository;
import com.youngjin.mcl_project.repository.BoardRepository;
import com.youngjin.mcl_project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자 주입을 자동으로 처리
public class BoardService {

    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final BoardCommentRepository commentRepository;
    // ⭐️ 파일 첨부 레포지토리를 주입합니다.
    private final BoardAttachmentsRepository attachmentsRepository;

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
     * 게시글 상세 정보를 조회하고 DTO로 변환하여 반환합니다.
     * 이 함수는 조회수 증가 로직을 포함해야 합니다.
     *
     * @param idx 게시글 ID
     * @return BoardDetailResponse DTO
     * @throws IllegalArgumentException 게시글이 존재하지 않을 경우
     */
    @Transactional
    public BoardDetailResponse getBoardDetail(long idx) {

        // 1. Repository를 통해 게시글 조회 (isDeleted=false인 것만)
        BoardEntity entity = boardRepository.findByIdxAndIsDeletedFalse(idx);

        if (entity == null) {
            throw new IllegalArgumentException("존재하지 않거나 삭제된 게시글입니다. ID: " + idx);
        }

        // 2. 조회수 증가 (트랜잭션 내에서 처리)
        entity.setHit(entity.getHit() + 1);

        // 3. Entity를 DTO로 변환
        String nickname = memberRepository.findNicknameByIdx(entity.getMemberIdx())
                .orElse("알 수 없음");

        // 💡 파일 첨부 목록 조회 (TODO: BoardAttachmentsRepository를 사용해야 합니다.)
        // List<FileAttachmentResponse> attachments = attachmentsRepository.findAllByBoardIdx(idx).stream()
        //                                            .map(FileAttachmentResponse::fromEntity)
        //                                            .collect(Collectors.toList());

        return BoardDetailResponse.builder()
                .idx(entity.getIdx())
                .boardType(entity.getBoardType())
                .title(entity.getTitle())
                .content(entity.getContent())
                .hit(entity.getHit())
                .recommend(entity.getRecommend())
                .regdate(entity.getRegdate())
                .moddate(entity.getModdate())
                .authorNickname(nickname)
                // .attachments(attachments)
                .build();
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
}