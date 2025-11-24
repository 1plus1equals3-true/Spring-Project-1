import React from "react";
import MainLayout from "../components/layout/MainLayout";
import CommonBoard from "../components/sections/CommonBoard";
import { useNavigate } from "react-router-dom";
// ⭐️ useAuth import
import { useAuth } from "../context/AuthContext";
import "../styles/BoardWriteBtn.css"; // 스타일 파일이 있다면 import

const NoticePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleWriteClick = () => {
    navigate("/board/notice/write");
  };

  return (
    <MainLayout>
      <div style={{ position: "relative", minHeight: "100%" }}>
        <CommonBoard
          title="📢 공지사항"
          description="서비스의 주요 업데이트 및 점검 일정을 확인하세요."
          boardType="NOTICE"
        />

        {/* 관리자(grade >= 9)일 때만 글쓰기 버튼 렌더링 */}
        {user && user.grade >= 9 && (
          <div className="write-btn-wrapper">
            <button className="write-btn" onClick={handleWriteClick}>
              <span>✏️ 공지 작성</span>
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NoticePage;
