import React, { useState, useEffect } from "react";
import PokeSampleCard from "./PokeSampleCard";
import { Trophy, Loader2 } from "lucide-react";
import apiClient from "../../api/apiClient"; // API 클라이언트 import 필요

// DTO 타입
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

// 탭 정의
const PERIOD_TABS = [
  { key: "DAILY", label: "오늘" },
  { key: "WEEKLY", label: "주간" },
  { key: "MONTHLY", label: "월간" },
  { key: "ALL", label: "전체" },
];

const BestSampleSection: React.FC = () => {
  const [period, setPeriod] = useState("DAILY"); // 기본값
  const [samples, setSamples] = useState<PokeSampleResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드 함수
  useEffect(() => {
    const fetchBestSamples = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<PokeSampleResponseDTO[]>(
          `/api/v1/poke-sample/best?period=${period}`
        );
        setSamples(res.data);
      } catch (err) {
        console.error("인기 샘플 로드 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSamples();
  }, [period]); // period가 바뀔 때마다 재실행

  return (
    <div className="grid-item full-width">
      {/* 헤더 영역 (제목 + 탭) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: 0,
          }}
        >
          <Trophy className="text-yellow-500" /> 인기 실전 샘플
        </h2>

        {/* 탭 버튼 그룹 */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            backgroundColor: "#f3f4f6",
            padding: "4px",
            borderRadius: "8px",
          }}
        >
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              style={{
                border: "none",
                background: period === tab.key ? "white" : "transparent",
                color: period === tab.key ? "#4f46e5" : "#6b7280",
                fontWeight: period === tab.key ? "bold" : "normal",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                boxShadow:
                  period === tab.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 리스트 영역 */}
      <div
        style={{
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7280" }}>
            {/* 로딩 스피너 추가 추천 */}
            <Loader2
              className="animate-spin"
              style={{ margin: "0 auto 10px" }}
            />
          </div>
        ) : samples.length > 0 ? (
          <div className="sample-grid" style={{ marginTop: "20px" }}>
            {samples.map((sample) => (
              <PokeSampleCard key={sample.idx} sample={sample} />
            ))}
          </div>
        ) : (
          <p
            className="no-content"
            style={{ padding: "20px", textAlign: "center", color: "#888" }}
          >
            집계된 인기 샘플이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default BestSampleSection;
