import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import BoardHeader from "../components/layout/BoardHeader";
import StatEditor from "../components/sections/StatEditor";
import { Loader2, Save, X } from "lucide-react";
import { POKE_NATURES, POKE_TYPES, POKE_ITEMS } from "../assets/tsx/PokeData";
import {
  POKEMON_NAME_MAP,
  ABILITY_MAP,
  MOVE_MAP,
} from "../assets/tsx/PokeData";

import "../styles/PokeSampleEditor.css";

// DTO 정의
interface PokeSampleRequestDTO {
  memberIdx?: number;
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
  visibility: "PUBLIC" | "PRIVATE";
}

const PokeSampleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API로 받아온 기술/특성 목록
  const [availableMoves, setAvailableMoves] = useState<
    { name: string; url: string }[]
  >([]);
  const [availableAbilities, setAvailableAbilities] = useState<
    { name: string; url: string }[]
  >([]);

  // 검색어 및 자동완성 UI 제어
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState<PokeSampleRequestDTO>({
    pokemonIdx: 25,
    pokemonName: "",
    teraType: "",
    item: "",
    nature: "",
    ability: "",
    ivs: "31/31/31/31/31/31",
    evs: "",
    move1: "",
    move2: "",
    move3: "",
    move4: "",
    description: "",
    visibility: "PUBLIC",
  });

  // 공통 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ⭐️ [수정] 검색어 변경 핸들러 (초기화 로직 추가)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);

    // 검색어를 다 지우면 -> 초기화 (검색 필요 상태로 복귀)
    if (value.trim() === "") {
      setAvailableMoves([]);
      setAvailableAbilities([]);
      setFormData((prev) => ({
        ...prev,
        pokemonName: "",
        ability: "",
        move1: "",
        move2: "",
        move3: "",
        move4: "",
      }));
    }
  };

  // 포켓몬 선택 핸들러
  const handleSelectPokemon = async (korName: string) => {
    const engName = POKEMON_NAME_MAP[korName];
    if (!engName) return;

    setSearchTerm(korName);
    setShowSuggestions(false);
    setLoading(true);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${engName}`);
      if (!res.ok) throw new Error("PokeAPI 호출 실패");
      const data = await res.json();

      // 폼 데이터 업데이트
      setFormData((prev) => ({
        ...prev,
        pokemonName: korName,
        pokemonIdx: data.id,
        ability: "", // 포켓몬 바뀌면 특성 초기화
        move1: "", // 기술 초기화
        move2: "",
        move3: "",
        move4: "",
      }));

      // 특성 목록 가공
      const abilities = data.abilities.map((ab: any) => ({
        name: ABILITY_MAP[ab.ability.name] || ab.ability.name,
        url: ab.ability.url,
      }));
      setAvailableAbilities(abilities);

      // 기술 목록 가공
      const moves = data.moves
        .map((mv: any) => ({
          name: MOVE_MAP[mv.move.name] || mv.move.name,
          url: mv.move.url,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      setAvailableMoves(moves);
    } catch (error) {
      console.error(error);
      alert("포켓몬 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 수정 모드 데이터 로드 ---
  useEffect(() => {
    if (isEditMode && id) {
      const fetchSample = async () => {
        setLoading(true);
        try {
          const res = await apiClient.get(`/api/v1/poke-sample/${id}`);
          const data = res.data;

          setFormData({
            pokemonIdx: data.pokemonIdx,
            pokemonName: data.pokemonName,
            teraType: data.teraType,
            item: data.item,
            nature: data.nature,
            ability: data.ability,
            ivs: data.ivs,
            evs: data.evs,
            move1: data.move1,
            move2: data.move2,
            move3: data.move3,
            move4: data.move4,
            description: data.description,
            visibility: data.visibility,
          });

          setSearchTerm(data.pokemonName);

          // ⚠️ 수정 모드에서도 기술 목록을 불러오려면 여기서 handleSelectPokemon 호출 필요
          // (지금은 편의상 생략됨 -> 사용자가 검색창 클릭해서 다시 선택하면 갱신됨)
        } catch (err) {
          alert("샘플 정보를 불러오지 못했습니다.");
          navigate(-1);
        } finally {
          setLoading(false);
        }
      };
      fetchSample();
    }
  }, [isEditMode, id, navigate]);

  // --- 제출 핸들러 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pokemonName) {
      alert("포켓몬 이름을 입력(검색)해주세요.");
      return;
    }
    if (!formData.teraType) {
      alert("테라스탈 타입을 선택해주세요.");
      return;
    }
    if (!formData.nature) {
      alert("성격을 선택해주세요.");
      return;
    }
    if (!formData.move1) {
      alert("최소 1개의 기술은 선택해야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await apiClient.put(`/api/v1/poke-sample/${id}`, formData);
        alert("샘플이 수정되었습니다!");
        navigate(`/poke-sample/${id}`, { replace: true });
      } else {
        const res = await apiClient.post("/api/v1/poke-sample", formData);
        alert("새로운 샘플이 등록되었습니다!");
        navigate(`/poke-sample/${res.data}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const preventEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="sample-editor-container">
        <BoardHeader
          title={isEditMode ? "샘플 수정" : "새 샘플 작성"}
          description="나만의 포켓몬 실전 샘플을 공유해보세요."
        />

        <form onSubmit={handleSubmit} onKeyDown={preventEnterKey}>
          {/* 1. 기본 정보 섹션 */}
          <div className="editor-section">
            <div className="section-title">📌 기본 정보</div>

            <div className="form-grid grid-2">
              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">포켓몬 검색</label>
                <input
                  type="text"
                  placeholder="포켓몬 이름 입력 (예: 리자몽)"
                  className="form-input"
                  value={searchTerm}
                  onChange={handleSearchChange} // ⭐️ 수정된 핸들러 연결
                  onFocus={() => setShowSuggestions(true)}
                />

                {showSuggestions && searchTerm && (
                  <ul className="autocomplete-list">
                    {Object.keys(POKEMON_NAME_MAP)
                      .filter((name) => name.includes(searchTerm))
                      .slice(0, 5)
                      .map((name) => (
                        <li
                          key={name}
                          onClick={() => handleSelectPokemon(name)}
                          className="autocomplete-item"
                        >
                          {name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{/* 도감 번호 */}</label>
                <input
                  type="hidden"
                  name="pokemonIdx"
                  value={formData.pokemonIdx}
                  readOnly
                  className="form-input bg-gray-100"
                />
              </div>
            </div>

            <div className="form-grid grid-4" style={{ marginTop: "16px" }}>
              <div className="form-group">
                <label className="form-label">테라스탈 타입</label>
                <select
                  name="teraType"
                  value={formData.teraType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">타입 선택</option>
                  {Object.entries(POKE_TYPES).map(([eng, kor]) => (
                    <option key={eng} value={kor}>
                      {kor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">지닌 도구</label>
                <select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">도구 선택</option>
                  {Object.entries(POKE_ITEMS).map(([eng, kor]) => (
                    <option key={eng} value={kor}>
                      {kor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">성격</label>
                <select
                  name="nature"
                  value={formData.nature}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">성격 선택</option>
                  {Object.entries(POKE_NATURES).map(([eng, kor]) => (
                    <option key={eng} value={kor}>
                      {kor}
                    </option>
                  ))}
                </select>
              </div>

              {/* ⭐️ 특성: 목록이 있으면 Select, 없으면 Input(Disabled) */}
              <div className="form-group">
                <label className="form-label">특성</label>
                {availableAbilities.length > 0 ? (
                  <select
                    name="ability"
                    value={formData.ability}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">특성 선택</option>
                    {availableAbilities.map((ab) => (
                      <option key={ab.name} value={ab.name}>
                        {ab.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value="특성 (검색 필요)"
                    className="form-input bg-gray-100 text-gray-400"
                    readOnly
                    disabled
                  />
                )}
              </div>
            </div>
          </div>

          {/* 2. 기술 배치 섹션 */}
          <div className="editor-section">
            <div className="section-title">⚔️ 기술 배치</div>
            <div className="form-grid grid-2">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="form-group">
                  <span className="move-badge-static">Move {num}</span>
                  {availableMoves.length > 0 ? (
                    <select
                      name={`move${num}`}
                      // @ts-ignore
                      value={formData[`move${num}`]}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">기술 선택</option>
                      {availableMoves.map((mv) => (
                        <option key={mv.name} value={mv.name}>
                          {mv.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value="기술 목록 (검색 필요)" // ⭐️ 안내 문구 변경
                      className="form-input move-input bg-gray-100 text-gray-400"
                      readOnly
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. 스탯 설정 */}
          <div className="editor-section">
            <div className="section-title">📊 스탯 설정</div>
            <StatEditor
              ivs={formData.ivs}
              evs={formData.evs}
              onChange={(newIvs, newEvs) => {
                setFormData((prev) => ({
                  ...prev,
                  ivs: newIvs,
                  evs: newEvs,
                }));
              }}
            />
          </div>

          {/* 4. 설명 및 설정 (기존 동일) */}
          <div className="editor-section">
            <div className="section-title">📝 운영법 및 설정</div>
            <div className="form-group">
              <label className="form-label">상세 설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="이 샘플의 운영 방법이나 주의사항을 적어주세요."
                rows={6}
                className="form-textarea"
              />
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">공개 설정</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="form-select"
                style={{ maxWidth: "200px" }}
              >
                <option value="PUBLIC">전체 공개</option>
                <option value="PRIVATE">나만 보기</option>
              </select>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-cancel"
              disabled={isSubmitting}
            >
              <X size={18} /> 취소
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {isEditMode ? "수정 완료" : "작성 완료"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default PokeSampleEditorPage;
