import React, { useState, useEffect } from "react";
import "../../styles/StatEditor.css"; // 스타일은 아래에 정의

interface StatEditorProps {
  ivs: string; // "31/31/31/x/31/31"
  evs: string; // "H4 A252 S252"
  onChange: (newIvs: string, newEvs: string) => void;
}

const STAT_LABELS = ["HP", "공격", "방어", "특공", "특방", "스피드"];
const STAT_KEYS = ["H", "A", "B", "C", "D", "S"]; // EV 문자열 생성용

const StatEditor: React.FC<StatEditorProps> = ({ ivs, evs, onChange }) => {
  // 내부 상태 관리 (배열 형태)
  const [ivArray, setIvArray] = useState<string[]>(Array(6).fill("31"));
  const [evArray, setEvArray] = useState<number[]>(Array(6).fill(0));

  // 1. 부모의 문자열 데이터를 받아서 배열로 변환 (초기화)
  useEffect(() => {
    // IV 파싱 ("31/31/31..." -> ["31", "31", ...])
    if (ivs) {
      const parsedIvs = ivs.split("/");
      if (parsedIvs.length === 6) setIvArray(parsedIvs);
    }

    // EV 파싱 ("H4 A252 S252" -> [4, 252, 0, 0, 0, 252])
    // 이 부분은 형식이 다양해서(띄어쓰기 등) 정규식으로 처리하는 게 안전하지만,
    // 일단 간단한 파서로 구현합니다. (기존 데이터가 없다면 0으로 초기화)
    if (evs) {
      const newEvs = [0, 0, 0, 0, 0, 0];
      const parts = evs.split(" ");
      parts.forEach((part) => {
        const key = part.charAt(0).toUpperCase();
        const val = parseInt(part.substring(1)) || 0;
        const index = STAT_KEYS.indexOf(key);
        if (index !== -1) newEvs[index] = val;
      });
      // 값이 하나라도 있으면 적용 (초기 로딩)
      if (parts.length > 0 && parts[0] !== "") setEvArray(newEvs);
    }
  }, []); // 마운트 시 1회만 실행 (또는 리셋 필요시 의존성 추가)

  // 2. 값이 변경될 때마다 부모에게 문자열로 변환해서 전달
  const updateParent = (newIvs: string[], newEvs: number[]) => {
    const ivString = newIvs.join("/");

    // EV는 0이 아닌 것만 모아서 "H4 A252" 형태로 만듦
    const evString = newEvs
      .map((val, idx) => (val > 0 ? `${STAT_KEYS[idx]}${val}` : null))
      .filter((v) => v !== null)
      .join(" ");

    onChange(ivString, evString || "0"); // 비어있으면 0
  };

  // IV 변경 핸들러
  const handleIvChange = (index: number, value: string) => {
    const newIvs = [...ivArray];
    newIvs[index] = value;
    setIvArray(newIvs);
    updateParent(newIvs, evArray);
  };

  // EV 변경 핸들러
  const handleEvChange = (index: number, value: number) => {
    if (value < 0) value = 0;
    if (value > 252) value = 252;

    const newEvs = [...evArray];
    newEvs[index] = value;

    // 총합 검사 (510 초과 방지)
    const total = newEvs.reduce((a, b) => a + b, 0);
    if (total > 510) {
      // 초과하면 입력 무시 (또는 남은 만큼만 채워주는 로직 추가 가능)
      return;
    }

    setEvArray(newEvs);
    updateParent(ivArray, newEvs);
  };

  const totalEv = evArray.reduce((a, b) => a + b, 0);

  return (
    <div className="stat-editor-box">
      <div className="stat-header">
        <span>스탯</span>
        <span>개체값 (IV)</span>
        <span>
          노력치 (EV){" "}
          <small className={totalEv > 510 ? "text-red" : ""}>
            ({totalEv}/510)
          </small>
        </span>
      </div>

      {STAT_LABELS.map((label, i) => (
        <div key={i} className="stat-row">
          <div className="stat-label">{label}</div>

          {/* IV 선택 (Select) */}
          <div className="iv-control">
            <select
              value={ivArray[i]}
              onChange={(e) => handleIvChange(i, e.target.value)}
              className={`iv-select ${ivArray[i] === "31" ? "best" : ""}`}
            >
              <option value="31">V (31)</option>
              <option value="30">U (30)</option>
              <option value="0">Z (0)</option>
              <option value="x">x (무관)</option>
            </select>
          </div>

          {/* EV 입력 (Slider + Input + Quick Btn) */}
          <div className="ev-control">
            <input
              type="range"
              min="0"
              max="252"
              step="4"
              value={evArray[i]}
              onChange={(e) => handleEvChange(i, parseInt(e.target.value))}
              className="ev-slider"
            />
            <input
              type="number"
              value={evArray[i]}
              onChange={(e) => handleEvChange(i, parseInt(e.target.value) || 0)}
              className="ev-input"
            />
            <div className="quick-btns">
              <button type="button" onClick={() => handleEvChange(i, 0)}>
                0
              </button>
              <button type="button" onClick={() => handleEvChange(i, 4)}>
                4
              </button>
              <button type="button" onClick={() => handleEvChange(i, 252)}>
                252
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatEditor;
