import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import type { UserInfo } from "../context/AuthContext";
import {
  Loader2,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  CornerDownRight,
} from "lucide-react";
import "../styles/BoardDetailPage.css";

// 본문 렌더링 최적화 컴포넌트 ( 재 렌더링 방지 )
const PostContent = React.memo(({ content }: { content: string }) => {
  return (
    <div
      className="detail-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

// --- 타입 정의 ---

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
  isRecommended: boolean;
  commentCount: number;
}

interface BoardCommentResponse {
  idx: number;
  boardIdx: number;
  parentIdx: number | null;
  authorNickname: string;
  ment: string;
  regdate: string | number[];
  moddate: string | number[];
  isDeleted: boolean;
  replies: BoardCommentResponse[];
}

// ⭐️ [핵심] CommentItem에 전달할 Props 정의
interface CommentItemProps {
  comment: BoardCommentResponse;
  depth: number;
  user: UserInfo | null;
  // 상태 값들
  activeReplyId: number | null;
  replyInput: string;
  editingCommentId: number | null;
  editInput: string;
  // 핸들러들
  onOpenReply: (id: number, nickname: string) => void;
  onReplyChange: (val: string) => void;
  onReplySubmit: (parentId: number) => void;
  onCancelReply: () => void;
  onStartEdit: (id: number, content: string) => void;
  onEditChange: (val: string) => void;
  onEditSubmit: (id: number) => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  formatDateTime: (date: string | number[] | undefined) => string;
}

// 부모가 리렌더링 되어도 content prop이 안 바뀌면 다시 그리지 않음 (이미지 재로딩 방지)

// ⭐️ [핵심] 컴포넌트 밖으로 꺼낸 CommentItem
// 이제 BoardDetailPage가 리렌더링 되어도 이 컴포넌트는 유지되므로 포커스가 안 끊깁니다.
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth,
  user,
  activeReplyId,
  replyInput,
  editingCommentId,
  editInput,
  onOpenReply,
  onReplyChange,
  onReplySubmit,
  onCancelReply,
  onStartEdit,
  onEditChange,
  onEditSubmit,
  onCancelEdit,
  onDelete,
  formatDateTime,
}) => {
  const indentation = depth === 0 ? 0 : 40;
  const isEditingReply = activeReplyId === comment.idx;
  const isEditing = editingCommentId === comment.idx;

  return (
    <div className="comment-tree-node">
      <div
        className={`comment-item ${depth > 0 ? "is-reply" : ""}`}
        style={{ marginLeft: `${indentation}px` }}
      >
        {depth > 0 && (
          <div className="reply-icon-container">
            <CornerDownRight size={16} className="text-gray-400" />
          </div>
        )}

        <div className="comment-content-box">
          <div className="comment-meta">
            <span className="comment-author">{comment.authorNickname}</span>
            <span className="comment-date">
              {formatDateTime(comment.regdate)}
            </span>
          </div>

          <div className="comment-text">
            {comment.isDeleted ? (
              <span className="text-gray-400 italic">삭제된 댓글입니다.</span>
            ) : isEditing ? (
              // 수정 폼
              <div className="comment-edit-form">
                <textarea
                  className="comment-edit-textarea"
                  value={editInput}
                  onChange={(e) => onEditChange(e.target.value)}
                  rows={2}
                />
                <div className="comment-edit-actions">
                  <button
                    className="save-btn"
                    onClick={() => onEditSubmit(comment.idx)}
                  >
                    저장
                  </button>
                  <button className="cancel-btn" onClick={onCancelEdit}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 일반 텍스트
              <span style={{ whiteSpace: "pre-wrap" }}>{comment.ment}</span>
            )}
          </div>

          {/* 액션 버튼 */}
          {!comment.isDeleted && user && !isEditing && (
            <div className="comment-actions">
              <button
                className="comment-action-btn"
                onClick={() => onOpenReply(comment.idx, comment.authorNickname)}
              >
                답글
              </button>

              {user.nickname === comment.authorNickname && (
                <>
                  <button
                    className="comment-action-btn"
                    onClick={() => onStartEdit(comment.idx, comment.ment)}
                  >
                    수정
                  </button>
                  <button
                    className="comment-action-btn delete"
                    onClick={() => onDelete(comment.idx)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 답글 작성 폼 */}
      {isEditingReply && (
        <div
          className="reply-input-wrapper"
          style={{ marginLeft: `${depth === 0 ? 40 : 40}px` }}
        >
          <div className="reply-input-box">
            <textarea
              className="reply-textarea"
              value={replyInput}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder="답글을 입력하세요..."
              rows={2}
            />
            <div className="reply-form-actions">
              <button className="cancel-btn" onClick={onCancelReply}>
                취소
              </button>
              <button
                className="submit-btn"
                onClick={() => onReplySubmit(comment.idx)}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재귀 렌더링 (Props를 그대로 자식에게 전달) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-list">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.idx}
              comment={reply}
              depth={depth + 1}
              user={user}
              activeReplyId={activeReplyId}
              replyInput={replyInput}
              editingCommentId={editingCommentId}
              editInput={editInput}
              onOpenReply={onOpenReply}
              onReplyChange={onReplyChange}
              onReplySubmit={onReplySubmit}
              onCancelReply={onCancelReply}
              onStartEdit={onStartEdit}
              onEditChange={onEditChange}
              onEditSubmit={onEditSubmit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              formatDateTime={formatDateTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BoardDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const boardId = parseInt(id || "0");
  const boardTypeUrl = type === "notice" ? "notice" : "free";

  const [post, setPost] = useState<BoardDetailResponse | null>(null);
  const [comments, setComments] = useState<BoardCommentResponse[]>([]);

  const [commentInput, setCommentInput] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (dateInput: string | number[] | undefined): string => {
    if (!dateInput) return "";
    let dateObj;
    if (Array.isArray(dateInput)) {
      dateObj = new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0,
        dateInput[5] || 0
      );
    } else {
      dateObj = new Date(dateInput);
    }
    return dateObj.toLocaleString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchData = async () => {
    if (boardId === 0) return;
    setLoading(true);
    setError(null);
    try {
      const postRes = await apiClient.get<BoardDetailResponse>(
        `/api/v1/board/${boardId}`
      );
      setPost(postRes.data);
      const commentRes = await apiClient.get<BoardCommentResponse[]>(
        `/api/v1/board/comment/list/${boardId}`
      );
      setComments(commentRes.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError("게시글을 찾을 수 없습니다.");
      } else {
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  // --- 핸들러 ---

  const handleRecommend = async () => {
    if (!post) return;
    try {
      await apiClient.post(`/api/v1/board/recommend/${boardId}`);
      setPost((prev) => {
        if (!prev) return null;
        const newIsRecommended = !prev.isRecommended;
        return {
          ...prev,
          isRecommended: newIsRecommended,
          recommend: newIsRecommended ? prev.recommend + 1 : prev.recommend - 1,
        };
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        if (
          window.confirm(
            "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
          )
        ) {
          navigate("/login");
        }
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      await apiClient.post("/api/v1/board/comment", {
        boardIdx: boardId,
        ment: commentInput,
        parentIdx: null,
      });
      setCommentInput("");
      fetchData();
    } catch (err) {
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyInput.trim()) return;
    try {
      await apiClient.post("/api/v1/board/comment", {
        boardIdx: boardId,
        ment: replyInput,
        parentIdx: parentId,
      });
      setReplyInput("");
      setActiveReplyId(null);
      fetchData();
    } catch (err) {
      alert("답글 작성에 실패했습니다.");
    }
  };

  // --- 수정 관련 핸들러 ---
  const startEditing = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditInput(currentContent);
    setActiveReplyId(null);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditInput("");
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editInput.trim()) return;
    try {
      await apiClient.put("/api/v1/board/comment", {
        idx: commentId,
        ment: editInput,
      });
      setEditingCommentId(null);
      setEditInput("");
      fetchData();
    } catch (err) {
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // --- 답글 관련 핸들러 ---
  const openReplyInput = (commentId: number, authorName: string) => {
    if (activeReplyId === commentId) {
      setActiveReplyId(null);
    } else {
      setActiveReplyId(commentId);
      setReplyInput(`@${authorName} `);
      setEditingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentIdx: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/v1/board/comment/${commentIdx}`);
      fetchData();
    } catch (err) {
      alert("댓글 삭제 권한이 없거나 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/v1/board/${boardId}`);
      alert("게시글이 삭제되었습니다.");
      navigate(`/board/${boardTypeUrl}`, { replace: true });
    } catch (err) {
      // ...
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="detail-loading-container">
          <Loader2 className="detail-spinner" size={40} />
          <p>로딩 중...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="detail-error-container">
          <AlertCircle size={40} />
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            목록으로
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="detail-container">
        <div className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">{post.authorNickname}</span>
            <span className="detail-info-separator">|</span>
            <span className="detail-date">{formatDateTime(post.regdate)}</span>
            <span className="detail-info-separator">|</span>
            <span>조회 {post.hit}</span>
          </div>
        </div>

        <div className="detail-content-wrapper">
          <PostContent content={post.content} />
          <div className="detail-stats">
            <button
              onClick={handleRecommend}
              className={`stat-item recommend-btn ${
                post.isRecommended ? "active" : ""
              }`}
            >
              <ThumbsUp
                size={18}
                fill={post.isRecommended ? "currentColor" : "none"}
              />
              <span>추천 {post.recommend}</span>
            </button>
            <span className="stat-item">
              <MessageSquare size={16} /> 댓글 {post.commentCount}
            </span>
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="action-btn back-to-list-btn"
            onClick={() => navigate(-1)}
          >
            목록으로
          </button>
          {user && user.nickname === post.authorNickname && (
            <div className="action-group">
              <button
                className="action-btn edit-btn"
                onClick={() =>
                  navigate(`/board/${boardTypeUrl}/${boardId}/edit`)
                }
              >
                수정
              </button>
              <button
                className="action-btn delete-btn"
                onClick={handleDeletePost}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="comments-section">
          <h3 className="comments-title">댓글 {post.commentCount}개</h3>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                className="comment-textarea"
                placeholder="댓글을 남겨보세요."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
              />
              <button type="submit" className="comment-submit-btn">
                등록
              </button>
            </form>
          ) : (
            <div className="login-plz-box">
              <p>댓글을 작성하려면 로그인이 필요합니다.</p>
              <button onClick={() => navigate("/login")}>
                로그인 하러가기
              </button>
            </div>
          )}
          <div className="comments-list-wrapper">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.idx}
                  comment={comment}
                  depth={0}
                  // 필요한 모든 Props를 전달합니다.
                  user={user}
                  activeReplyId={activeReplyId}
                  replyInput={replyInput}
                  editingCommentId={editingCommentId}
                  editInput={editInput}
                  onOpenReply={openReplyInput}
                  onReplyChange={setReplyInput}
                  onReplySubmit={handleReplySubmit}
                  onCancelReply={() => setActiveReplyId(null)}
                  onStartEdit={startEditing}
                  onEditChange={setEditInput}
                  onEditSubmit={handleUpdateComment}
                  onCancelEdit={cancelEditing}
                  onDelete={handleDeleteComment}
                  formatDateTime={formatDateTime}
                />
              ))
            ) : (
              <p className="no-comments">아직 댓글이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BoardDetailPage;
