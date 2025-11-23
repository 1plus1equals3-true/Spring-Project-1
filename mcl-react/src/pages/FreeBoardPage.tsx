import React from "react";
import MainLayout from "../components/layout/MainLayout";
import CommonBoard from "../components/sections/CommonBoard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/BoardWriteBtn.css";

const FreeBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 글쓰기 버튼 클릭 핸들러
  const handleWriteClick = () => {
    navigate("/board/free/write");
  };

  return (
    <MainLayout>
      <div style={{ position: "relative", minHeight: "100%" }}>
        <CommonBoard
          title="🏡 자유게시판"
          description="자유롭게 의견을 나누고 소통하는 공간입니다."
          boardType="FREE"
        />

        {/* ⭐️ 글쓰기 버튼 , user가 존재할 때만 렌더링 */}
        {user && (
          <div className="write-btn-wrapper">
            <button className="write-btn" onClick={handleWriteClick}>
              <span>✏️ 글쓰기</span>
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FreeBoardPage;
