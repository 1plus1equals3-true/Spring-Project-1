import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import type { UserInfo } from "../context/AuthContext";
import {
  Loader2,
  Heart,
  Eye,
  Edit,
  Trash2,
  Lock,
  ArrowLeft,
  MessageSquare,
  CornerDownRight,
} from "lucide-react";
import "../styles/PokeSampleStyle.css";
import "../styles/BoardDetailPage.css"; // 댓글 스타일 재사용

// --- 타입 정의 ---

interface PokeSampleDetailDTO {
  idx: number;
  authorNickname: string;
  pokemonIdx: number;
  pokemonName: string;
  teraType: string;
  item: string;
  nature: string;
  ability: string;
  ivs: string;
  evs: string;
  move1: string;
  move2: string;
  move3: string;
  move4: string;
  description: string;
  hit: number;
  likeCount: number;
  isLiked: boolean;
  isMine: boolean;
  commentCount: number;
  regdate: string | number[];
  visibility: "PUBLIC" | "PRIVATE";
}

interface CommentResponse {
  idx: number;
  sampleIdx: number; // boardIdx -> sampleIdx
  parentIdx: number | null;
  authorNickname: string;
  ment: string;
  regdate: string | number[];
  moddate: string | number[];
  isDeleted: boolean;
  replies: CommentResponse[];
}

// --- 1. 댓글 아이템 컴포넌트 (Board와 동일) ---
interface CommentItemProps {
  comment: CommentResponse;
  depth: number;
  user: UserInfo | null;
  activeReplyId: number | null;
  replyInput: string;
  editingCommentId: number | null;
  editInput: string;
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
              <span style={{ whiteSpace: "pre-wrap" }}>{comment.ment}</span>
            )}
          </div>

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

      {/* 대댓글 재귀 렌더링 */}
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

// --- 2. 메인 페이지 컴포넌트 ---
const PokeSampleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sampleId = parseInt(id || "0");

  const [sample, setSample] = useState<PokeSampleDetailDTO | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 댓글 관련 State
  const [commentInput, setCommentInput] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");

  // 날짜 포맷팅 헬퍼
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

  // 데이터 로드
  const fetchDetail = async () => {
    try {
      // 샘플 정보
      const resSample = await apiClient.get(`/api/v1/poke-sample/${sampleId}`);
      setSample(resSample.data);

      // 댓글 정보 (API 주소 변경: /api/v1/poke-sample/comment/list/...)
      const resComments = await apiClient.get(
        `/api/v1/poke-sample/comment/list/${sampleId}`
      );
      setComments(resComments.data);
    } catch (err) {
      alert("정보를 불러올 수 없습니다.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sampleId) fetchDetail();
  }, [sampleId]);

  // --- 핸들러 ---

  // 1. 좋아요
  const handleLike = async () => {
    if (!sample) return;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const res = await apiClient.post(
        `/api/v1/poke-sample/like/${sample.idx}`
      );
      const isLikedNow = res.data;
      setSample((prev) =>
        prev
          ? {
              ...prev,
              isLiked: isLikedNow,
              likeCount: isLikedNow ? prev.likeCount + 1 : prev.likeCount - 1,
            }
          : null
      );
    } catch (err) {
      console.error("좋아요 오류", err);
    }
  };

  // 2. 샘플 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/v1/poke-sample/${sampleId}`);
      alert("삭제되었습니다.");
      navigate("/poke-sample/list");
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  // 3. 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      await apiClient.post("/api/v1/poke-sample/comment", {
        sampleIdx: sampleId,
        ment: commentInput,
        parentIdx: null,
      });
      setCommentInput("");
      fetchDetail();
    } catch (err) {
      alert("댓글 작성 실패");
    }
  };

  // 4. 답글 작성
  const handleReplySubmit = async (parentId: number) => {
    if (!replyInput.trim()) return;
    try {
      await apiClient.post("/api/v1/poke-sample/comment", {
        sampleIdx: sampleId,
        ment: replyInput,
        parentIdx: parentId,
      });
      setReplyInput("");
      setActiveReplyId(null);
      fetchDetail();
    } catch (err) {
      alert("답글 작성 실패");
    }
  };

  // 5. 댓글 수정
  const handleUpdateComment = async (commentId: number) => {
    if (!editInput.trim()) return;
    try {
      await apiClient.put("/api/v1/poke-sample/comment", {
        idx: commentId,
        ment: editInput,
      });
      setEditingCommentId(null);
      setEditInput("");
      fetchDetail();
    } catch (err) {
      alert("댓글 수정 실패");
    }
  };

  // 6. 댓글 삭제
  const handleDeleteComment = async (commentIdx: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/v1/poke-sample/comment/${commentIdx}`);
      fetchDetail();
    } catch (err) {
      alert("댓글 삭제 실패");
    }
  };

  // UI 제어 핸들러
  const openReplyInput = (commentId: number, authorName: string) => {
    if (activeReplyId === commentId) {
      setActiveReplyId(null);
    } else {
      setActiveReplyId(commentId);
      setReplyInput(`@${authorName} `);
      setEditingCommentId(null);
    }
  };

  const startEditing = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditInput(currentContent);
    setActiveReplyId(null);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditInput("");
  };

  if (loading || !sample) {
    return (
      <MainLayout>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </MainLayout>
    );
  }

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${sample.pokemonIdx}.png`;
  const isPrivate = sample.visibility === "PRIVATE";

  return (
    <MainLayout>
      <div className="sample-detail-container">
        {/* 상단 카드 */}
        <div
          className={`detail-top-card ${
            isPrivate ? "private-detail-card" : ""
          }`}
        >
          <div className="header-row">
            <img
              src={spriteUrl}
              alt={sample.pokemonName}
              style={{ width: "100px", height: "100px" }}
            />
            <div className="detail-title-group">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <h1>{sample.pokemonName}</h1>
                {isPrivate && (
                  <span className="badge-private-detail">
                    <Lock size={16} /> 비공개
                  </span>
                )}
              </div>
              <div className="detail-meta">
                작성자: {sample.authorNickname} | 조회 {sample.hit}
              </div>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={handleLike}
                className={`stat-item recommend-btn ${
                  sample.isLiked ? "active" : ""
                }`}
                style={{ fontSize: "1.1rem", padding: "8px 16px" }}
              >
                <Heart
                  size={24}
                  fill={sample.isLiked ? "currentColor" : "none"}
                />
                <span>{sample.likeCount}</span>
              </button>
            </div>
          </div>

          {/* 기술 배치 */}
          <div>
            <div
              style={{
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#6b7280",
              }}
            >
              MOVES
            </div>
            <div className="moves-container">
              <div className="move-box">{sample.move1}</div>
              <div className="move-box">{sample.move2}</div>
              <div className="move-box">{sample.move3}</div>
              <div className="move-box">{sample.move4}</div>
            </div>
          </div>

          {/* 스탯 테이블 */}
          <div className="stats-grid">
            <table className="info-table">
              <tbody>
                <tr>
                  <th>성격</th>
                  <td>{sample.nature}</td>
                </tr>
                <tr>
                  <th>특성</th>
                  <td>{sample.ability}</td>
                </tr>
                <tr>
                  <th>지닌물건</th>
                  <td>{sample.item}</td>
                </tr>
              </tbody>
            </table>
            <table className="info-table">
              <tbody>
                <tr>
                  <th>테라스탈</th>
                  <td>{sample.teraType}</td>
                </tr>
                <tr>
                  <th>개체값 (IVs)</th>
                  <td>{sample.ivs}</td>
                </tr>
                <tr>
                  <th>노력치 (EVs)</th>
                  <td>{sample.evs}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 설명란 */}
          <div>
            <div
              style={{
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#6b7280",
              }}
            >
              MEMO
            </div>
            <div className="description-box">
              {sample.description || "작성된 설명이 없습니다."}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="detail-actions">
            <button
              className="action-btn back-to-list-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} /> 목록으로
            </button>
            {sample.isMine && (
              <div className="action-group">
                <button
                  className="action-btn edit-btn"
                  onClick={() => navigate(`/poke-sample/${sample.idx}/edit`)}
                >
                  <Edit size={18} /> 수정
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={handleDelete}
                >
                  <Trash2 size={18} /> 삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ⭐️ 댓글 섹션 (BoardDetailPage에서 복사 후 조정) */}
        <div className="comments-section">
          <h3
            className="comments-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <MessageSquare size={20} /> 댓글 {sample.commentCount}개
          </h3>

          {/* 댓글 작성 */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                className="comment-textarea"
                placeholder="이 샘플에 대한 의견을 남겨주세요."
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

          {/* 댓글 목록 */}
          <div className="comments-list-wrapper">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.idx}
                  comment={comment}
                  depth={0}
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

export default PokeSampleDetailPage;
