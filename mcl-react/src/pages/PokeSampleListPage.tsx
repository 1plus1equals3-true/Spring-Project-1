import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import {
  Loader2,
  AlertCircle,
  Eye,
  Heart,
  Search,
  ChevronDown,
} from "lucide-react";
import "../styles/PokeSampleStyle.css";
import "../styles/BoardWriteBtn.css";

// DTO (백엔드와 동일)
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
  regdate: string | number[];
}

// Page 응답 껍데기
interface PageResponse<T> {
  content: T[];
  last: boolean; // 마지막 페이지 여부
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 현재 페이지 번호
}

const PokeSampleListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();

  // 데이터 상태
  const [samples, setSamples] = useState<PokeSampleResponseDTO[]>([]);
  const [page, setPage] = useState(0); // 현재 로드된 페이지 번호
  const [isLast, setIsLast] = useState(false); // 더 불러올게 없는지?
  const [loading, setLoading] = useState(false);

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");
  const keywordFromUrl = searchParams.get("keyword") || "";

  // 1. 초기화 (검색어나 ID가 바뀌면 싹 비우고 0페이지부터 다시 시작)
  useEffect(() => {
    setSamples([]);
    setPage(0);
    setIsLast(false);
    fetchData(0, true); // 첫 페이지 로드 (초기화 모드 = true)
  }, [id, keywordFromUrl]);

  // 2. 데이터 페칭 함수
  const fetchData = async (pageNum: number, isReset: boolean) => {
    if (loading) return; // 중복 호출 방지
    setLoading(true);

    try {
      let url = `/api/v1/poke-sample/list?page=${pageNum}&size=12`;

      if (id) {
        url += `&pokemonIdx=${id}`;
      } else if (keywordFromUrl) {
        url += `&keyword=${keywordFromUrl}`;
      }

      const res = await apiClient.get<PageResponse<PokeSampleResponseDTO>>(url);
      const newContent = res.data.content;
      const isLastPage = res.data.last;

      if (isReset) {
        // 초기화면 덮어쓰기
        setSamples(newContent);
      } else {
        // 더보기면 뒤에 붙이기
        setSamples((prev) => [...prev, ...newContent]);
      }

      setIsLast(isLastPage);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. 더보기 버튼 핸들러
  const handleLoadMore = () => {
    if (!isLast && !loading) {
      fetchData(page + 1, false);
    }
  };

  // 검색 핸들러 (URL 변경 -> useEffect 발동)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/poke-sample/list?keyword=${searchTerm}`);
    } else {
      navigate(`/poke-sample/list`);
    }
  };

  // 헬퍼 함수들 (이미지, 날짜)
  const getPokemonImageUrl = (idx: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idx}.png`;
  const formatDate = (dateInput: string | number[]) => {
    if (Array.isArray(dateInput))
      return `${dateInput[0]}.${dateInput[1]}.${dateInput[2]}`;
    return new Date(dateInput).toLocaleDateString();
  };

  return (
    <MainLayout>
      <div className="sample-list-container">
        <div className="board-header">
          <h1 className="board-title">
            {id ? `No.${id} 샘플 리스트` : "실전 샘플 도감"}
          </h1>
          <p className="board-desc">
            최신 메타와 다양한 전략을 확인하고 공유해보세요.
          </p>
        </div>

        {/* 검색창 */}
        <div
          style={{
            margin: "20px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              width: "100%",
              maxWidth: "500px",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="포켓몬 이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-submit"
              style={{ padding: "10px 20px" }}
            >
              <Search size={18} /> 검색
            </button>
            {(id || keywordFromUrl) && (
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => {
                  setSearchTerm("");
                  navigate("/poke-sample/list");
                }}
              >
                전체보기
              </button>
            )}
          </form>
        </div>

        {/* 리스트 그리드 */}
        <div className="sample-grid">
          {samples.map((sample) => (
            <div
              key={sample.idx}
              className="sample-card"
              onClick={() => navigate(`/poke-sample/${sample.idx}`)}
            >
              {/* 카드 내용 (기존 코드와 동일) */}
              <div className="card-header">
                <img
                  src={getPokemonImageUrl(sample.pokemonIdx)}
                  alt={sample.pokemonName}
                  className="poke-sprite"
                />
                <div>
                  <div className="poke-name">{sample.pokemonName}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    by {sample.authorNickname}
                  </div>
                </div>
              </div>
              <div className="card-badges">
                <span className="badge badge-tera">Tera {sample.teraType}</span>
                <span className="badge badge-nature">{sample.nature}</span>
                <span className="badge badge-item">{sample.item}</span>
              </div>
              <div className="card-moves">
                <div className="move-item">▪ {sample.move1}</div>
                <div className="move-item">▪ {sample.move2}</div>
                <div className="move-item">▪ {sample.move3}</div>
                <div className="move-item">▪ {sample.move4}</div>
              </div>
              <div className="card-footer">
                <span>{formatDate(sample.regdate)}</span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Eye size={14} /> {sample.hit}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Heart size={14} /> {sample.likeCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 로딩 표시 */}
        {loading && (
          <div className="loading-container" style={{ margin: "20px 0" }}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && samples.length === 0 && (
          <div
            className="empty-message"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <p>등록된 샘플이 없습니다.</p>
          </div>
        )}

        {/* ⭐️ [핵심] 더보기 버튼 (마지막 페이지가 아니고, 로딩중이 아닐 때만 표시) */}
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
              style={{ width: "200px", padding: "12px", fontSize: "1rem" }}
            >
              <ChevronDown size={20} /> 더보기
            </button>
          </div>
        )}

        <div className="write-btn-wrapper">
          <button
            className="write-btn"
            onClick={() => navigate("/poke-sample/write")}
          >
            <span>✏️ 샘플 등록</span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PokeSampleListPage;
