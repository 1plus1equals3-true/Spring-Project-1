import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
  Loader2,
  ThumbsUp,
  Eye,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import "../styles/PokeSampleStyle.css";

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
  regdate: string | number[];
}

const PokeSampleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sample, setSample] = useState<PokeSampleDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/api/v1/poke-sample/${id}`);
        setSample(res.data);
      } catch (err) {
        alert("샘플을 불러올 수 없습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  // 좋아요 핸들러
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
      const isLikedNow = res.data; // true or false

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

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/api/v1/poke-sample/${id}`);
      alert("삭제되었습니다.");
      navigate(-1); // 이전 페이지로
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
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

  return (
    <MainLayout>
      <div className="sample-detail-container">
        {/* 상단 카드 */}
        <div className="detail-top-card">
          <div className="header-row">
            <img
              src={spriteUrl}
              alt={sample.pokemonName}
              style={{ width: "100px", height: "100px" }}
            />
            <div className="detail-title-group">
              <h1>{sample.pokemonName}</h1>
              <div className="detail-meta">
                작성자: {sample.authorNickname} | 조회 {sample.hit}
              </div>
            </div>

            {/* 좋아요 버튼 (우측 배치) */}
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={handleLike}
                className={`stat-item recommend-btn ${
                  sample.isLiked ? "active" : ""
                }`}
                style={{ fontSize: "1.1rem", padding: "8px 16px" }}
              >
                <ThumbsUp
                  size={24}
                  fill={sample.isLiked ? "currentColor" : "none"}
                />
                <span>{sample.likeCount}</span>
              </button>
            </div>
          </div>

          {/* 기술 배치 (핵심) */}
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

          {/* 상세 스펙 테이블 */}
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

          {/* 하단 버튼들 */}
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
      </div>
    </MainLayout>
  );
};

export default PokeSampleDetailPage;
