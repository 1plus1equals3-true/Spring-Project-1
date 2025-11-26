package com.youngjin.mcl_project.service;

import com.youngjin.mcl_project.dto.PokeSampleCommentCreationRequest;
import com.youngjin.mcl_project.dto.PokeSampleCommentResponse;
import com.youngjin.mcl_project.dto.PokeSampleCommentUpdateRequest;
import com.youngjin.mcl_project.entity.PokeSampleComment;
import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.repository.MemberRepository;
import com.youngjin.mcl_project.repository.PokeSampleCommentRepository;
import com.youngjin.mcl_project.repository.PokeSampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PokeSampleCommentService {

    private final PokeSampleCommentRepository commentRepository;
    private final PokeSampleRepository sampleRepository; // 샘플 존재 확인용
    private final MemberRepository memberRepository;     // 닉네임 조회용

    /**
     * 댓글 작성
     */
    @Transactional
    public Long createComment(PokeSampleCommentCreationRequest request, long memberIdx) {
        // 1. 샘플 존재 확인
        PokeSampleEntity sample = sampleRepository.findByIdxAndIsDeletedFalse(request.getSampleIdx())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 샘플입니다."));

        // 2. 부모 댓글 확인 (대댓글일 경우)
        PokeSampleComment parent = null;
        if (request.getParentIdx() != null) {
            parent = commentRepository.findById(request.getParentIdx())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글이 존재하지 않습니다."));
        }

        // 3. 저장
        PokeSampleComment comment = PokeSampleComment.builder()
                .pokeSample(sample)
                .memberIdx(memberIdx)
                .ment(request.getMent())
                .parent(parent) // 연관관계 설정
                .isDeleted(false)
                .build();

        return commentRepository.save(comment).getIdx();
    }

    /**
     * 댓글 수정
     */
    @Transactional
    public void updateComment(PokeSampleCommentUpdateRequest request, long memberIdx) {
        PokeSampleComment comment = commentRepository.findById(request.getIdx())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        if (comment.isDeleted()) {
            throw new IllegalArgumentException("삭제된 댓글은 수정할 수 없습니다.");
        }

        if (!comment.getMemberIdx().equals(memberIdx)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        comment.updateMent(request.getMent());
        // Dirty Checking에 의해 자동 update
    }

    /**
     * 댓글 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteComment(Long idx, long memberIdx) {
        PokeSampleComment comment = commentRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));

        if (comment.isDeleted()) {
            throw new IllegalArgumentException("이미 삭제된 댓글입니다.");
        }

        if (!comment.getMemberIdx().equals(memberIdx)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        comment.changeDeleted(true);
    }

    /**
     * 댓글 목록 조회 (계층형 변환)
     */
    @Transactional(readOnly = true)
    public List<PokeSampleCommentResponse> getCommentList(Long sampleIdx) {
        // 1. 전체 댓글 조회
        List<PokeSampleComment> entities = commentRepository.findAllByPokeSampleIdxOrderByRegdateAsc(sampleIdx);

        // 2. 닉네임 일괄 조회 (N+1 방지)
        List<Long> memberIdxs = entities.stream()
                .map(PokeSampleComment::getMemberIdx)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> nicknameMap = memberRepository.findAllNicknameByIdxs(memberIdxs).stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (String) obj[1]
                ));

        // 3. DTO 변환 및 Map핑
        Map<Long, PokeSampleCommentResponse> dtoMap = entities.stream()
                .map(entity -> {
                    PokeSampleCommentResponse dto = PokeSampleCommentResponse.fromEntity(entity);
                    dto.setAuthorNickname(nicknameMap.getOrDefault(entity.getMemberIdx(), "알 수 없음"));
                    return dto;
                })
                .collect(Collectors.toMap(PokeSampleCommentResponse::getIdx, dto -> dto));

        // 4. 계층 구조 조립
        List<PokeSampleCommentResponse> rootComments = new ArrayList<>();

        for (PokeSampleCommentResponse dto : dtoMap.values()) {
            if (dto.getParentIdx() == null) {
                rootComments.add(dto);
            } else {
                PokeSampleCommentResponse parent = dtoMap.get(dto.getParentIdx());
                if (parent != null) {
                    parent.getReplies().add(dto);
                }
            }
        }

        return rootComments;
    }
}