import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import BoardHeader from "../components/layout/BoardHeader";
import { Loader2, Save, X } from "lucide-react"; // 아이콘 사용
import { POKE_NATURES, POKE_TYPES } from "../assets/tsx/PokeData";

import "../styles/PokeSampleEditor.css"; // 스타일 파일 import

// DTO 정의 (백엔드와 일치)
interface PokeSampleRequestDTO {
  memberIdx?: number; // Controller에서 처리하므로 전송시엔 필요 없을수도 있음
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
  const { id } = useParams<{ id: string }>(); // id가 있으면 수정 모드
  const navigate = useNavigate();
  const isEditMode = !!id;

  // --- State 관리 ---
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터 (초기값)
  const [formData, setFormData] = useState<PokeSampleRequestDTO>({
    pokemonIdx: 25, // 일단 피카츄 기본값 (추후 검색 모달 연동 필요)
    pokemonName: "",
    teraType: "",
    item: "",
    nature: "",
    ability: "",
    ivs: "31/31/31/x/31/31", // 자주 쓰는 V/Z 표기 기본값
    evs: "H4 A252 S252",
    move1: "",
    move2: "",
    move3: "",
    move4: "",
    description: "",
    visibility: "PUBLIC",
  });

  // 입력 핸들러 (모든 input 공용)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 데이터 불러오기 (수정 모드) ---
  useEffect(() => {
    if (isEditMode && id) {
      const fetchSample = async () => {
        setLoading(true);
        try {
          const res = await apiClient.get(`/api/v1/poke-sample/${id}`);
          const data = res.data;
          // 응답 데이터를 폼 데이터 형식에 맞춰 매핑
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

    // 유효성 검사 (Validation) (상황에 맞게 추가하기)
    if (!formData.pokemonName) {
      alert("포켓몬 이름을 입력해주세요.");
      return;
    }
    if (!formData.teraType) {
      // "" 빈 문자열이면 false 취급됨
      alert("테라스탈 타입을 선택해주세요.");
      return;
    }
    if (!formData.nature) {
      alert("성격을 선택해주세요.");
      return;
    }
    if (!formData.move1) {
      alert("최소 1개의 기술은 입력해야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        // 수정 (PUT)
        await apiClient.put(`/api/v1/poke-sample/${id}`, formData);
        alert("샘플이 수정되었습니다!");
        navigate(`/poke-sample/${id}`); // 상세 페이지로 이동
      } else {
        // 작성 (POST)
        const res = await apiClient.post("/api/v1/poke-sample", formData);
        alert("새로운 샘플이 등록되었습니다!");
        navigate(`/poke-sample/${res.data}`); // 생성된 상세 페이지로 이동
      }
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleSubmit}>
          {/* 1. 기본 정보 섹션 */}
          <div className="editor-section">
            <div className="section-title">📌 기본 정보</div>
            <div className="form-grid grid-2">
              {/* 포켓몬 이름 (추후 자동완성/검색 기능 붙이면 좋음) */}
              <div className="form-group">
                <label className="form-label">포켓몬 이름</label>
                <input
                  type="text"
                  name="pokemonName"
                  value={formData.pokemonName}
                  onChange={handleChange}
                  placeholder="예: 한카리아스"
                  className="form-input"
                />
              </div>
              {/* 도감 번호 (임시: 직접 입력 or 이름 입력시 자동 검색 구현 예정) */}
              <div className="form-group">
                <label className="form-label">도감 번호</label>
                <input
                  type="number"
                  name="pokemonIdx"
                  value={formData.pokemonIdx}
                  onChange={handleChange}
                  className="form-input"
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
                      {kor}{" "}
                      {/* 화면에는 '불꽃', '물' 처럼 한글만 깔끔하게 표시 */}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">지닌 도구</label>
                <input
                  type="text"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  placeholder="예: 구애머리띠"
                  className="form-input"
                />
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
                      {/* ({eng}) */}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">특성</label>
                <input
                  type="text"
                  name="ability"
                  value={formData.ability}
                  onChange={handleChange}
                  placeholder="예: 까칠한피부"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 2. 기술 배치 섹션 */}
          <div className="editor-section">
            <div className="section-title">⚔️ 기술 배치</div>
            <div className="form-grid grid-2">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="form-group move-input-group">
                  <span className="move-badge">Move {num}</span>
                  <input
                    type="text"
                    name={`move${num}`}
                    // @ts-ignore: 동적 키 접근
                    value={formData[`move${num}`]}
                    onChange={handleChange}
                    placeholder="기술 이름"
                    className="form-input move-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. 노력치 및 개체값 */}
          <div className="editor-section">
            <div className="section-title">📊 스탯 설정</div>
            <div className="form-grid grid-2">
              <div className="form-group">
                <label className="form-label">개체값 (IVs)</label>
                <input
                  type="text"
                  name="ivs"
                  value={formData.ivs}
                  onChange={handleChange}
                  placeholder="예: 31/31/31/x/31/31"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">노력치 (EVs)</label>
                <input
                  type="text"
                  name="evs"
                  value={formData.evs}
                  onChange={handleChange}
                  placeholder="예: H4 A252 S252"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 4. 상세 설명 및 설정 */}
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
