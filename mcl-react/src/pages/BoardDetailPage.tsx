import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/layout/MainLayout";
import { API_BASE_URL } from "../config/defaultconfig";
import { Loader2, AlertCircle, ThumbsUp, MessageSquare } from "lucide-react";
import "../styles/BoardDetailPage.css";

// 백엔드 BoardDetailResponse DTO 기반 타입 정의
interface BoardDetailResponse {
  idx: number;
  boardType: "NOTICE" | "FREE";
  title: string;
  content: string;
  hit: number;
  recommend: number;
  regdate: string | number[];
  moddate: string | number[];
  authorNickname: string;
  // attachments: FileAttachmentResponse[]; // 첨부파일 DTO는 현재 제외
}

const BoardDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const boardId = parseInt(id || "0");
  const [post, setPost] = useState<BoardDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const boardTypeUrl = type === "notice" ? "notice" : "free";

  // 날짜 변환 헬퍼 함수
  const formatDateTime = (dateInput: string | number[] | undefined): string => {
    if (!dateInput) return "날짜 정보 없음";

    let dateObj;
    if (Array.isArray(dateInput)) {
      dateObj = new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0
      );
    } else {
      dateObj = new Date(dateInput);
    }

    // YYYY.MM.DD HH:MM 형식으로 포맷
    return dateObj
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\./g, ".")
      .replace(/ /g, " ")
      .trim();
  };

  const fetchPostDetail = async () => {
    if (boardId === 0) {
      setError("유효하지 않은 게시글 ID입니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<BoardDetailResponse>(
        `${API_BASE_URL}/api/v1/board/${boardId}`
      );
      setPost(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status === 404) {
          setError("요청하신 게시글을 찾을 수 없습니다.");
        } else {
          setError("게시글 상세 정보를 불러오는데 실패했습니다.");
        }
      } else {
        setError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [boardId]);

  // 수정 버튼 핸들러
  const handleEdit = () => {
    // /board/free/:id/edit 또는 /board/notice/:id/edit 경로로 이동
    navigate(`/board/${boardTypeUrl}/${boardId}/edit`);
  };

  // 삭제 버튼 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      // DELETE /api/v1/board/{idx} 호출
      await axios.delete(`${API_BASE_URL}/api/v1/board/${boardId}`, {
        withCredentials: true, // 쿠키(세션/토큰) 전달 필수
      });

      alert("게시글이 삭제되었습니다.");

      // 목록 페이지로 이동 (뒤로 가기 방지)
      navigate(`/board/${boardTypeUrl}`, { replace: true });
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          alert("로그인이 필요하거나 인증 세션이 만료되었습니다.");
        } else if (err.response?.status === 403) {
          // 본인 글이 아닐 경우 등
          alert("게시글을 삭제할 권한이 없습니다.");
        } else if (err.response?.status === 400) {
          alert("잘못된 요청입니다. (이미 삭제되었거나 권한이 없습니다.)");
        } else {
          alert("삭제 중 오류가 발생했습니다.");
        }
      } else {
        alert("네트워크 오류가 발생했습니다.");
      }
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <MainLayout>
        <div className="detail-loading-container">
          <Loader2 className="detail-spinner" size={40} />
          <p>게시글을 불러오는 중...</p>
        </div>
      </MainLayout>
    );
  }

  // 에러 상태
  if (error || !post) {
    return (
      <MainLayout>
        <div className="detail-error-container">
          <AlertCircle size={40} />
          <p className="error-message">
            {error || "게시글을 찾을 수 없습니다."}
          </p>
          <button
            onClick={() => navigate(`/board/${boardTypeUrl}`)}
            className="back-btn"
          >
            목록으로 돌아가기
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="detail-container">
        {/* 헤더: 제목 및 기본 정보 */}
        <div className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">작성자: {post.authorNickname}</span>
            <span className="detail-info-separator">|</span>
            <span className="detail-date">
              등록일: {formatDateTime(post.regdate)}
            </span>
            <span className="detail-info-separator">|</span>
            <span className="detail-views">조회수: {post.hit}</span>
            {post.moddate && (
              <>
                <span className="detail-info-separator">|</span>
                <span className="detail-modified">
                  수정됨: {formatDateTime(post.moddate)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="detail-content-wrapper">
          {/* 본문 내용 */}
          <div
            className="detail-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 추천 및 댓글 수 */}
          <div className="detail-stats">
            <span className="stat-item">
              <ThumbsUp size={16} /> 추천: {post.recommend}
            </span>
            <span className="stat-item">
              <MessageSquare size={16} /> 댓글: 0 (TODO)
            </span>
          </div>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="detail-actions">
          <button
            className="action-btn back-to-list-btn"
            onClick={() => navigate(`/board/${boardTypeUrl}`)}
          >
            목록으로
          </button>
          <div className="action-group">
            {/* 수정 버튼: /board/:type/:id/edit 경로로 이동 */}
            <button className="action-btn edit-btn" onClick={handleEdit}>
              수정
            </button>
            {/* 삭제 버튼: 임시 핸들러 연결 */}
            <button className="action-btn delete-btn" onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>

        {/* TODO: 댓글 컴포넌트 영역 */}
        <div className="comments-section">
          <h2 className="comments-title">댓글 (0)</h2>
          <div className="comments-list">
            <div className="comment-placeholder">
              댓글 기능이 준비 중입니다.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BoardDetailPage;
