package com.youngjin.mcl_project.controller;

import com.youngjin.mcl_project.dto.*;
import com.youngjin.mcl_project.entity.BoardEntity.BoardType;
import com.youngjin.mcl_project.service.BoardCommentService;
import com.youngjin.mcl_project.service.BoardService;
import com.youngjin.mcl_project.service.MemberService;
import com.youngjin.mcl_project.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final BoardCommentService boardCommentService;
    private final MemberService memberService;

    // ⭐️ DB 조회를 통해 현재 로그인한 유저의 idx를 가져오는 메서드
    private long getCurrentMemberIdx() {
        String providerId;
        try {
            // 1. Security Context에서 ProviderId (로그인 ID)를 가져옵니다.
            providerId = SecurityUtil.getCurrentProviderId();
        } catch (RuntimeException e) {
            // Security Context에 인증 정보가 없을 경우 (SecurityUtil에서 던지는 예외)
            log.warn("Security Context에 인증 정보가 없어 비로그인 처리: {}", e.getMessage());
            return 0L;
        }

        // providerId가 "anonymousUser"인 경우 즉시 0L 반환
        if ("anonymousUser".equals(providerId)) {
            log.warn("비로그인 사용자(anonymousUser)가 인증이 필요한 API 접근 시도.");
            return 0L;
        }

        try {
            // 2. MemberService의 정의된 메서드를 사용하여 ProviderId를 기반으로 memberIdx를 조회합니다.
            // MemberService.getMemberIdxByProviderId는 회원을 찾을 수 없을 때 IllegalArgumentException을 던집니다.
            long memberIdx = memberService.getMemberIdxByProviderId(providerId);
            log.debug("인증된 사용자 ProviderId: {}, MemberIdx: {}", providerId, memberIdx);
            return memberIdx;
        } catch (IllegalArgumentException e) {
            // 해당 ProviderId를 가진 사용자가 DB에 없을 경우 (예: JWT는 유효하나 계정 삭제됨)
            log.error("DB에서 ProviderId에 해당하는 MemberIdx를 찾을 수 없습니다: {}", providerId, e);
            // 인증은 되었지만 사용자 정보가 유효하지 않으므로 접근 거부 예외를 다시 던집니다.
            throw new RuntimeException("유효하지 않은 사용자 정보입니다.", e);
        }
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

        String providerId = null;
        try {
            providerId = SecurityUtil.getCurrentProviderId();
            if ("anonymousUser".equals(providerId)) {
                providerId = null;
            }
        } catch (Exception e) {
            // 비로그인 사용자도 글은 볼 수 있어야 하므로 예외 발생 시 null 처리
            providerId = null;
        }

        try {
            BoardDetailResponse detail = boardService.getBoardDetail(idx, providerId);
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

        // 💡 인증이 필요한 API이므로, memberIdx가 0L(비로그인)인 경우 처리
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

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

        // 💡 인증이 필요한 API이므로, memberIdx가 0L(비로그인)인 경우 처리
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

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

        // 💡 인증이 필요한 API이므로, memberIdx가 0L(비로그인)인 경우 처리
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

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

        // 💡 인증이 필요한 API이므로, memberIdx가 0L(비로그인)인 경우 처리
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

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

        // 💡 인증이 필요한 API이므로, memberIdx가 0L(비로그인)인 경우 처리
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

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

        // 💡 인증이 필요한 API이므로, memberIdx가 0L(비로그인)인 경우 처리
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

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

    // --- 4. 파일 업로드 API ---

    /**
     * 에디터 이미지 업로드 (비동기)
     * POST /api/v1/board/image-upload
     */
    @PostMapping("/image-upload")
    public ResponseEntity<BoardImageUploadResponse> uploadBoardImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpServletRequest) {

        long memberIdx = getCurrentMemberIdx();

        // 비로그인 사용자도 이미지를 업로드 불가
        if (memberIdx == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("게시판 이미지 업로드 요청: MemberIdx={}", memberIdx);

        try {
            BoardImageUploadResponse response = boardService.uploadTempFile(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("이미지 업로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- 5. 게시글 추천 API ---

    /**
     * 게시글 추천 토글 (ON/OFF)
     * POST /api/v1/board/recommend/{idx}
     */
    @PostMapping("/recommend/{idx}")
    public ResponseEntity<String> toggleRecommend(@PathVariable Long idx) {

        // 1. 현재 로그인한 사용자 확인
        String providerId;
        try {
            providerId = SecurityUtil.getCurrentProviderId();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        if ("anonymousUser".equals(providerId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // 2. 서비스 호출
        try {
            String message = boardService.toggleRecommendation(idx, providerId);
            return ResponseEntity.ok(message); // "추천하였습니다." 또는 "추천이 취소되었습니다."
        } catch (IllegalArgumentException e) {
            log.error("추천 처리 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("추천 처리 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }

    // 활동기록 게시글 일괄 삭제
    @DeleteMapping("/delete-batch")
    public ResponseEntity<Void> deleteBoardsBatch(@RequestBody List<Long> boardIdxList) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // Service에 일괄 삭제 메서드 추가 필요 (반복문으로 deleteBoard 호출하거나 쿼리 사용)
        // 편의상 반복문으로 처리 예시
        for (Long idx : boardIdxList) {
            try {
                boardService.deleteBoard(idx, memberIdx);
            } catch (Exception e) {
                log.error("일괄 삭제 중 오류 (ID: {})", idx, e);
            }
        }
        return ResponseEntity.ok().build();
    }

    // 활동기록 댓글 일괄 삭제
    @DeleteMapping("/comment/delete-batch")
    public ResponseEntity<Void> deleteCommentsBatch(@RequestBody List<Long> commentIdxList) {
        long memberIdx = getCurrentMemberIdx();
        if (memberIdx == 0) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        for (Long idx : commentIdxList) {
            try {
                boardCommentService.deleteComment(idx, memberIdx);
            } catch (Exception e) {
                log.error("댓글 일괄 삭제 중 오류 (ID: {})", idx, e);
            }
        }
        return ResponseEntity.ok().build();
    }
}