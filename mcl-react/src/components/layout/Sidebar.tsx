import React from "react";
import { useNavigate } from "react-router-dom";

// 🚨 임시 데이터 (로그인 상태)
interface SidebarProps {
  isLoggedIn: boolean; // 실제는 useAuth() 훅으로 상태를 받아와야 함
}

const Sidebar: React.FC<SidebarProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      navigate("/login"); // 🔑 로그인 페이지 경로
    } else {
      navigate("/mypage"); // 👤 사용자 정보 페이지 경로
    }
  };

  return (
    <div className="sidebar">
      {/* 🔑 로그인/로그아웃 버튼 */}
      <button
        className={`login-button ${isLoggedIn ? "logged-in" : "logged-out"}`}
        onClick={handleLoginClick}
      >
        {isLoggedIn ? "👤 내 정보 / 로그아웃" : "🔑 로그인 / 회원가입"}
      </button>

      <h2>🧭 메뉴</h2>
      <nav className="main-nav">
        {/* React Router Link 컴포넌트로 변경 예정 */}
        <a href="/my-collection" className="nav-item highlight">
          🚀 내 컬렉션 정리하기
        </a>
        <a href="/board/free">📢 자유게시판</a>
        <a href="/board/review">⭐ 리뷰 게시판</a>
      </nav>
    </div>
  );
};

export default Sidebar;
