import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import PokeSampleCard from "../components/sections/PokeSampleCard";
import { useAuth } from "../context/AuthContext";
import { Loader2, FolderOpen, Heart, ChevronDown } from "lucide-react";
import "../styles/PokeSampleStyle.css";
import "../styles/Mypage.css";

// DTO 타입 (Card와 동일해야 함)
interface PokeSampleResponseDTO {
  idx: number;
  authorNickname: string;
  pokemonIdx: number;
  pokemonName: string;
  teraType: string;
  item: string;
  nature: string;
  ability: string;
  move1: string;
  move2: string;
  move3: string;
  move4: string;
  hit: number;
  likeCount: number;
  commentCount: number;
  regdate: string | number[];
  visibility: "PUBLIC" | "PRIVATE";
}

interface PageResponse<T> {
  content: T[];
  last: boolean;
}

// 탭 정의
const TABS = [
  { key: "my-posts", name: "내 샘플 보관함", icon: FolderOpen },
  { key: "liked-posts", name: "좋아요한 샘플", icon: Heart },
];

const MyCollectionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my-posts");
  const [samples, setSamples] = useState<PokeSampleResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);

  // 탭이 바뀌면 데이터 초기화 & 로드
  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setSamples([]);
    setPage(0);
    setIsLast(false);
    fetchData(0, true);
  }, [activeTab, user, navigate]);

  // 데이터 로드 함수
  const fetchData = async (pageNum: number, isReset: boolean) => {
    if (loading) return;
    setLoading(true);

    try {
      // 탭에 따라 다른 API 엔드포인트 호출
      const endpoint =
        activeTab === "my-posts"
          ? "/api/v1/poke-sample/list/mine"
          : "/api/v1/poke-sample/list/liked";

      const res = await apiClient.get<PageResponse<PokeSampleResponseDTO>>(
        `${endpoint}?page=${pageNum}&size=12`
      );

      if (isReset) {
        setSamples(res.data.content);
      } else {
        setSamples((prev) => [...prev, ...res.data.content]);
      }
      setIsLast(res.data.last);
      setPage(pageNum);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLast) fetchData(page + 1, false);
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="sample-list-container">
        {" "}
        {/* 기존 스타일 활용 */}
        <div className="board-header">
          <h1 className="board-title">나만의 컬렉션</h1>
          <p className="board-desc">
            내가 작성한 샘플과 관심 있는 샘플을 모아보세요.
          </p>
        </div>
        {/* 탭 네비게이션 (MyPage 스타일 적용) */}
        <div className="tab-navigation" style={{ marginBottom: "20px" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
        {/* 로딩 중이고 데이터가 없을 때 */}
        {loading && samples.length === 0 && (
          <div className="loading-container">
            <Loader2 className="animate-spin" size={40} />
          </div>
        )}
        {/* 데이터 리스트 */}
        {!loading && samples.length === 0 ? (
          <div
            className="empty-message"
            style={{ textAlign: "center", padding: "60px" }}
          >
            <p>
              {activeTab === "my-posts"
                ? "아직 등록한 샘플이 없습니다."
                : "좋아요를 누른 샘플이 없습니다."}
            </p>
            {activeTab === "my-posts" && (
              <button
                className="btn btn-submit"
                style={{ marginTop: "20px" }}
                onClick={() => navigate("/poke-sample/write")}
              >
                첫 샘플 등록하기
              </button>
            )}
          </div>
        ) : (
          <div className="sample-grid">
            {samples.map((sample) => (
              // ♻️ 분리한 카드 컴포넌트 사용
              <PokeSampleCard key={sample.idx} sample={sample} />
            ))}
          </div>
        )}
        {/* 더보기 버튼 */}
        {!isLast && !loading && samples.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            <button
              onClick={handleLoadMore}
              className="btn btn-cancel"
              style={{ width: "200px", padding: "12px" }}
            >
              <ChevronDown size={20} /> 더보기
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyCollectionPage;
