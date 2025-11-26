import React from "react";
import { Eye, Heart, Lock, MessageSquare } from "lucide-react"; // 자물쇠, 지구본 아이콘 추가
import { useNavigate } from "react-router-dom";
import "../../styles/PokeSampleStyle.css";

// DTO에 visibility 필드 꼭 있어야 함!
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
  visibility: "PUBLIC" | "PRIVATE"; // ⭐️ 필드 확인 필수
}

interface Props {
  sample: PokeSampleResponseDTO;
}

const PokeSampleCard: React.FC<Props> = ({ sample }) => {
  const navigate = useNavigate();
  const isPrivate = sample.visibility === "PRIVATE";

  const getPokemonImageUrl = (idx: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idx}.png`;

  const formatDate = (dateInput: string | number[]) => {
    if (Array.isArray(dateInput))
      return `${dateInput[0]}.${dateInput[1]}.${dateInput[2]}`;
    return new Date(dateInput).toLocaleDateString();
  };

  return (
    <div
      // ⭐️ 비공개일 때 'private-card' 클래스 추가
      className={`sample-card ${isPrivate ? "private-card" : ""}`}
      onClick={() => navigate(`/poke-sample/${sample.idx}`)}
    >
      {/* ⭐️ 비공개/공개 상태 표시 아이콘 (우측 상단) */}
      <div className="visibility-badge">
        {isPrivate ? (
          <span className="badge-private">
            <Lock size={14} /> 비공개
          </span>
        ) : // 공개인 경우 굳이 안 보여줘도 되지만, 구분을 원하시면 아래 주석 해제
        // <span className="badge-public"><Globe size={14} /> 공개</span>
        null}
      </div>

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

      {/* ... (배지 및 기술 부분은 기존과 동일) ... */}
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
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Eye size={14} /> {sample.hit}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Heart size={14} /> {sample.likeCount}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageSquare size={14} /> {sample.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PokeSampleCard;
