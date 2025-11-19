package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.BoardCommentCreationRequest;
import com.youngjin.mcl_project.dto.BoardCommentResponse;
import com.youngjin.mcl_project.dto.BoardCommentUpdateRequest;
import com.youngjin.mcl_project.entity.BoardCommentEntity;
import com.youngjin.mcl_project.repository.BoardCommentRepository;
import com.youngjin.mcl_project.repository.BoardRepository;
import com.youngjin.mcl_project.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardCommentRepository commentRepository;
    private final BoardRepository boardRepository; // 게시글 존재 여부 확인용
    private final MemberRepository memberRepository; // 작성자 닉네임 조회용

    /**
     * 댓글 또는 대댓글을 생성합니다.
     * * @param request 댓글 생성 요청 DTO
     * @param memberIdx 현재 로그인된 사용자 ID
     * @return 생성된 댓글 ID
     */
    @Transactional
    public long createComment(BoardCommentCreationRequest request, long memberIdx, String ipAddress) {

        // 1. 게시글 존재 여부 확인 (Soft Delete 되지 않은 게시글인지 확인)
        if (boardRepository.findByIdxAndIsDeletedFalse(request.getBoardIdx()) == null) {
            throw new IllegalArgumentException("댓글을 작성할 게시글이 존재하지 않거나 삭제되었습니다. ID: " + request.getBoardIdx());
        }

        // 2. 대댓글인 경우, 부모 댓글 존재 여부 확인 (Optional)
        if (request.getParentIdx() != null) {
            if (!commentRepository.existsById(request.getParentIdx())) {
                throw new IllegalArgumentException("부모 댓글이 존재하지 않습니다. ID: " + request.getParentIdx());
            }
        }

        // 3. Entity 생성 및 저장
        BoardCommentEntity entity = BoardCommentEntity.builder()
                .boardIdx(request.getBoardIdx())
                .memberIdx(memberIdx)
                .ment(request.getMent())
                .parentIdx(request.getParentIdx())
                .regdate(LocalDateTime.now())
                .isDeleted(false)
                // IP 필드가 Entity에 없으므로 주석 처리
                // .ip(ipAddress)
                .build();

        BoardCommentEntity savedEntity = commentRepository.save(entity);
        return savedEntity.getIdx();
    }

    /**
     * 댓글을 수정합니다.
     * * @param request 댓글 수정 요청 DTO
     * @param memberIdx 현재 로그인된 사용자 ID (권한 확인용)
     */
    @Transactional
    public void updateComment(BoardCommentUpdateRequest request, long memberIdx) {

        // 1. 댓글 조회 및 존재 여부 확인
        BoardCommentEntity entity = commentRepository.findById(request.getIdx())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다. ID: " + request.getIdx()));

        // 2. 삭제된 댓글인지 확인 (Soft Delete 상태의 댓글은 수정 불가)
        if (entity.isDeleted()) {
            throw new IllegalArgumentException("이미 삭제된 댓글은 수정할 수 없습니다.");
        }

        // 3. 권한 확인 (작성자 본인인지)
        if (entity.getMemberIdx() != memberIdx) {
            throw new IllegalArgumentException("댓글 수정 권한이 없습니다.");
        }

        // 4. 내용 수정 및 시간 업데이트
        entity.setMent(request.getMent());
        entity.setModdate(LocalDateTime.now());

        // Dirty Checking으로 자동 업데이트
    }

    /**
     * 댓글을 소프트 삭제(Soft Delete) 처리합니다.
     * @param idx 삭제할 댓글 ID
     * @param memberIdx 현재 로그인된 사용자 ID (권한 확인용)
     */
    @Transactional
    public void deleteComment(long idx, long memberIdx) {

        // 1. 댓글 조회 및 존재 여부 확인
        BoardCommentEntity entity = commentRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다. ID: " + idx));

        // 2. 이미 삭제된 댓글인지 확인
        if (entity.isDeleted()) {
            throw new IllegalArgumentException("이미 삭제된 댓글입니다.");
        }

        // 3. 권한 확인 (작성자 본인인지)
        if (entity.getMemberIdx() != memberIdx) {
            throw new IllegalArgumentException("댓글 삭제 권한이 없습니다.");
        }

        // 4. 댓글 소프트 삭제
        entity.setDeleted(true);
        entity.setModdate(LocalDateTime.now());

        // Dirty Checking으로 자동 업데이트

        // 💡 주의: 대댓글이 달린 댓글의 경우 isDeleted=true 상태만 유지하고,
        // 내용(ment)은 '삭제된 댓글입니다.'로 표시하는 것이 일반적입니다. (Response DTO에서 처리)
        // 자식 댓글이 없는 경우에만 물리적 삭제를 고려할 수 있으나, 여기서는 일관성을 위해 소프트 삭제만 합니다.
    }

    /**
     * 특정 게시글의 댓글 목록을 계층형 구조(BoardCommentResponse)로 조회합니다.
     * * @param boardIdx 게시글 ID
     * @return 계층 구조화된 댓글 목록 (최상위 댓글만 리스트에 담겨 반환)
     */
    @Transactional(readOnly = true)
    public List<BoardCommentResponse> getCommentList(long boardIdx) {

        // 1. 해당 게시글의 모든 댓글 (삭제된 댓글 포함)을 가져옵니다.
        List<BoardCommentEntity> entities = commentRepository.findAllByBoardIdxOrderByRegdateAsc(boardIdx);

        // 2. 작성자 닉네임을 한 번에 조회하기 위한 Map 생성 (최적화)
        // 필요한 memberIdx 목록을 추출합니다.
        List<Long> memberIdxs = entities.stream()
                .map(BoardCommentEntity::getMemberIdx)
                .distinct()
                .collect(Collectors.toList());

        // ⭐️ 최적화된 DB 쿼리 호출: memberRepository.findAllNicknameByIdxs 사용
        // List<Object[]> 형태로 반환되며, 각 Object[]는 {memberIdx, nickname} 쌍입니다.
        List<Object[]> nicknameResults = memberRepository.findAllNicknameByIdxs(memberIdxs);

        // 닉네임 조회를 위한 Map 생성 (key: memberIdx, value: nickname)
        Map<Long, String> nicknameMap = nicknameResults.stream()
                .collect(Collectors.toMap(
                        result -> (Long) result[0], // memberIdx
                        result -> (String) result[1] // nickname
                ));

        // 3. Entity List를 DTO List로 변환하고 Map에 저장
        Map<Long, BoardCommentResponse> commentMap = entities.stream()
                .map(entity -> {
                    BoardCommentResponse dto = BoardCommentResponse.fromEntity(entity);
                    // 닉네임 설정 (Map에서 한 번에 찾음)
                    dto.setAuthorNickname(nicknameMap.getOrDefault(entity.getMemberIdx(), "탈퇴 회원"));
                    dto.setReplies(new ArrayList<>()); // 대댓글 리스트 초기화
                    return dto;
                })
                .collect(Collectors.toMap(BoardCommentResponse::getIdx, dto -> dto));


        // 4. 계층형 구조 생성
        List<BoardCommentResponse> rootComments = new ArrayList<>();

        for (BoardCommentResponse comment : commentMap.values()) {
            if (comment.getParentIdx() == null) {
                // 최상위 댓글 (ParentIdx가 NULL)
                rootComments.add(comment);
            } else {
                // 대댓글
                BoardCommentResponse parent = commentMap.get(comment.getParentIdx());
                if (parent != null) {
                    // 부모 댓글이 Map에 존재하는 경우에만 대댓글로 추가
                    parent.getReplies().add(comment);
                }
                // 부모 댓글이 Map에 없는 경우 (매우 드물지만 데이터 무결성 문제 시 발생 가능) 해당 댓글은 무시됩니다.
            }
        }

        return rootComments;
    }
}