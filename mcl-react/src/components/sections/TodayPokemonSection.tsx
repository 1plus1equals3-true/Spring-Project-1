import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { POKEMON_NAME_MAP } from "../../assets/tsx/PokeData";
import {
  Dna,
  ArrowRight,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Film,
} from "lucide-react";

const TodayPokemonSection: React.FC = () => {
  const navigate = useNavigate();

  // --- State ---
  const [todayPokemon, setTodayPokemon] = useState<{
    kor: string;
    eng: string;
    id: number;
  } | null>(null);

  const [loading, setLoading] = useState(true); // API 로딩
  const [imageLoading, setImageLoading] = useState(true); // 이미지 로딩
  const [showGif, setShowGif] = useState(false); // GIF 토글 상태

  // --- 랜덤 포켓몬 뽑기 함수 ---
  const fetchRandomPokemon = useCallback(() => {
    setLoading(true);
    setImageLoading(true); // 이미지 로딩도 초기화

    const names = Object.keys(POKEMON_NAME_MAP);
    const randomName = names[Math.floor(Math.random() * names.length)];
    const engName = POKEMON_NAME_MAP[randomName];

    fetch(`https://pokeapi.co/api/v2/pokemon/${engName}`)
      .then((res) => res.json())
      .then((data) => {
        setTodayPokemon({ kor: randomName, eng: engName, id: data.id });
      })
      .catch(() => {
        // 에러 시 피카츄(25)로 폴백
        setTodayPokemon({ kor: "피카츄", eng: "pikachu", id: 25 });
      })
      .finally(() => {
        // API 호출은 끝났지만, 이미지는 아직 로딩 중일 수 있음 -> 여기서 false 안 함
        setLoading(false);
      });
  }, []);

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    fetchRandomPokemon();
  }, [fetchRandomPokemon]);

  // --- 이미지 URL 생성 ---
  // showGif가 true면 움직이는 이미지(Showdown), false면 공식 일러스트
  const getImageUrl = (id: number) => {
    if (showGif) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  };

  // --- 렌더링 ---

  // 1. API 로딩 중일 때 (전체 스피너)
  if (loading || !todayPokemon) {
    return (
      <div
        className="grid-item half-width"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div
      className="grid-item half-width"
      style={{ display: "flex", flexDirection: "column", position: "relative" }}
    >
      {/* 헤더 영역 (제목 + 새로고침 버튼) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          <Dna className="text-purple-500" /> Random Pick
        </h2>
        <button
          onClick={fetchRandomPokemon}
          className="btn-icon-only"
          title="다른 포켓몬 보기"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {/* 이미지 영역 (스피너 + 이미지 + 토글) */}
        <div
          style={{
            position: "relative",
            width: "150px",
            height: "150px",
            marginBottom: "15px",
          }}
        >
          {/* 3. 이미지 로딩 스피너 (이미지 로드 전까지 표시) */}
          {imageLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2 className="animate-spin text-gray-300" size={40} />
            </div>
          )}

          {/* 실제 이미지 */}
          <img
            src={getImageUrl(todayPokemon.id)}
            alt={todayPokemon.kor}
            onLoad={() => setImageLoading(false)} // 로드 완료 시 스피너 제거
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: imageLoading ? "none" : "block", // 로딩 중엔 숨김 (깜빡임 방지)
            }}
          />

          {/* 4. GIF/이미지 토글 버튼 (우측 상단) */}
          <button
            onClick={() => {
              setShowGif(!showGif);
              setImageLoading(true); // 토글 시 로딩 다시 시작
            }}
            style={{
              position: "absolute",
              top: 0,
              right: -10,
              background: "rgba(255,255,255,0.8)",
              border: "1px solid #e5e7eb",
              borderRadius: "50%",
              padding: "6px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              color: "#4b5563",
            }}
            title={showGif ? "일러스트 보기" : "움직이는 모습 보기"}
          >
            {showGif ? <ImageIcon size={16} /> : <Film size={16} />}
          </button>
        </div>

        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "5px",
          }}
        >
          {todayPokemon.kor}
        </h3>
        <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>
          이 포켓몬의 다양한 전략을 확인해보세요!
        </p>

        <button
          className="btn btn-submit"
          style={{
            width: "100%",
            padding: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "5px",
          }}
          onClick={() =>
            navigate(`/poke-sample/list?keyword=${todayPokemon.kor}`)
          }
        >
          샘플 보러가기 <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TodayPokemonSection;
