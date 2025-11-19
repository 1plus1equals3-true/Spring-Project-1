package com.youngjin.mcl_project.controller;

import com.youngjin.mcl_project.dto.BoardCommentCreationRequest;
import com.youngjin.mcl_project.dto.BoardCommentResponse;
import com.youngjin.mcl_project.dto.BoardCommentUpdateRequest;
import com.youngjin.mcl_project.dto.BoardCreationRequest;
import com.youngjin.mcl_project.dto.BoardDetailResponse;
import com.youngjin.mcl_project.dto.BoardListResponse;
import com.youngjin.mcl_project.dto.BoardUpdateRequest;
import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import com.youngjin.mcl_project.service.BoardCommentService;
import com.youngjin.mcl_project.service.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final BoardCommentService boardCommentService;

    // ⭐️ 임시 인증 정보 및 IP 주소 추출
    // 실제 환경에서는 Spring Security와 Servlet API를 사용해야 합니다.
    private long getCurrentMemberIdx() {
        // 실제로는 SecurityContext에서 가져와야 함 (예시: 8번 사용자)
        return 8L;
    }

    private String getClientIp(HttpServletRequest request) {
        // 실제로는 X-Forwarded-For 헤더 등을 고려해야 함 (예시: 127.0.0.1)
        return "127.0.0.1";
    }

    // --- 1. 게시글 조회 API ---

    /**
     * 게시글 목록 조회 (BoardListPage.jsx에서 사용할 API)
     * GET /api/v1/board/list?type=FREE&page=0&size=10
     */
    @GetMapping("/list")
    public ResponseEntity<Page<BoardListResponse>> getBoardList(
            @RequestParam(defaultValue = "FREE") BoardType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("게시글 목록 조회 요청: Type={}, Page={}, Size={}", type, page, size);
        Page<BoardListResponse> result = boardService.getBoardList(type, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * 게시글 상세 조회
     * GET /api/v1/board/{idx}
     */
    @GetMapping("/{idx}")
    public ResponseEntity<BoardDetailResponse> getBoardDetail(@PathVariable long idx) {
        log.info("게시글 상세 조회 요청: ID={}", idx);

        try {
            BoardDetailResponse detail = boardService.getBoardDetail(idx);
            return ResponseEntity.ok(detail);
        } catch (IllegalArgumentException e) {
            log.error("게시글 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // --- 2. 게시글 CRUD API ---

    /**
     * 게시글 작성
     * POST /api/v1/board/create
     */
    @PostMapping("/create")
    public ResponseEntity<Long> createBoard(
            @RequestBody BoardCreationRequest request,
            HttpServletRequest httpServletRequest) {

        long memberIdx = getCurrentMemberIdx();
        String ipAddress = getClientIp(httpServletRequest);

        log.info("게시글 작성 요청: MemberIdx={}, Type={}", memberIdx, request.getBoardType());

        try {
            long newIdx = boardService.createBoard(request, memberIdx, ipAddress);
            return new ResponseEntity<>(newIdx, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("게시글 작성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 게시글 수정
     * PUT /api/v1/board/update
     */
    @PutMapping("/update")
    public ResponseEntity<Void> updateBoard(
            @RequestBody BoardUpdateRequest request,
            HttpServletRequest httpServletRequest) {

        long memberIdx = getCurrentMemberIdx();
        String ipAddress = getClientIp(httpServletRequest);

        log.info("게시글 수정 요청: ID={}, MemberIdx={}", request.getIdx(), memberIdx);

        try {
            boardService.updateBoard(request, memberIdx, ipAddress);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("게시글 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build(); // 권한 없음, 게시글 없음 등
        } catch (Exception e) {
            log.error("게시글 수정 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 게시글 삭제 (Soft Delete)
     * DELETE /api/v1/board/{idx}
     */
    @DeleteMapping("/{idx}")
    public ResponseEntity<Void> deleteBoard(@PathVariable long idx) {

        long memberIdx = getCurrentMemberIdx();
        log.info("게시글 삭제 요청: ID={}, MemberIdx={}", idx, memberIdx);

        try {
            boardService.deleteBoard(idx, memberIdx);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("게시글 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build(); // 권한 없음, 게시글 없음 등
        } catch (Exception e) {
            log.error("게시글 삭제 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- 3. 댓글 API ---

    /**
     * 댓글 목록 조회 (BoardDetailPage에서 사용)
     * GET /api/v1/board/comment/list/{boardIdx}
     */
    @GetMapping("/comment/list/{boardIdx}")
    public ResponseEntity<List<BoardCommentResponse>> getCommentList(@PathVariable long boardIdx) {
        log.info("댓글 목록 조회 요청: Board ID={}", boardIdx);
        List<BoardCommentResponse> comments = boardCommentService.getCommentList(boardIdx);
        return ResponseEntity.ok(comments);
    }

    /**
     * 댓글/대댓글 작성
     * POST /api/v1/board/comment
     */
    @PostMapping("/comment")
    public ResponseEntity<Long> createComment(
            @RequestBody BoardCommentCreationRequest request,
            HttpServletRequest httpServletRequest) {

        long memberIdx = getCurrentMemberIdx();
        String ipAddress = getClientIp(httpServletRequest);

        log.info("댓글 작성 요청: Board ID={}, MemberIdx={}", request.getBoardIdx(), memberIdx);

        try {
            long newIdx = boardCommentService.createComment(request, memberIdx, ipAddress);
            return new ResponseEntity<>(newIdx, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("댓글 작성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build(); // 게시글 없음 등
        } catch (Exception e) {
            log.error("댓글 작성 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 댓글 수정
     * PUT /api/v1/board/comment
     */
    @PutMapping("/comment")
    public ResponseEntity<Void> updateComment(@RequestBody BoardCommentUpdateRequest request) {

        long memberIdx = getCurrentMemberIdx();
        log.info("댓글 수정 요청: Comment ID={}, MemberIdx={}", request.getIdx(), memberIdx);

        try {
            boardCommentService.updateComment(request, memberIdx);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("댓글 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build(); // 권한 없음, 댓글 없음 등
        } catch (Exception e) {
            log.error("댓글 수정 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 댓글 삭제 (Soft Delete)
     * DELETE /api/v1/board/comment/{idx}
     */
    @DeleteMapping("/comment/{idx}")
    public ResponseEntity<Void> deleteComment(@PathVariable long idx) {

        long memberIdx = getCurrentMemberIdx();
        log.info("댓글 삭제 요청: Comment ID={}, MemberIdx={}", idx, memberIdx);

        try {
            boardCommentService.deleteComment(idx, memberIdx);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("댓글 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build(); // 권한 없음, 댓글 없음 등
        } catch (Exception e) {
            log.error("댓글 삭제 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}