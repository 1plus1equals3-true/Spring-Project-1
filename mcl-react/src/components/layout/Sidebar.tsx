import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  // ⭐️ useAuth 훅을 사용하여 상태와 함수를 가져옵니다.
  const { isLoggedIn, logout } = useAuth();

  const handleAuthAction = () => {
    if (!isLoggedIn) {
      navigate("/login"); // 🔑 로그인 페이지 경로
    } else {
      // 로그인 상태: 내 정보 페이지로 이동 (마이페이지 경로는 /mypage로 가정)
      navigate("/mypage");
    }
  };

  // ⭐️ 로그아웃 버튼 클릭 핸들러
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault(); // href가 있으면 클릭 방지
    logout(); // AuthContext의 logout 함수 호출
  };

  return (
    <div className="sidebar">
      {/* 🔑 로그인/내 정보 버튼 */} {" "}
      <button
        className={`login-button ${isLoggedIn ? "logged-in" : "logged-out"}`}
        onClick={handleAuthAction}
      >
        {isLoggedIn ? "👤 내 정보" : "🔑 로그인 / 회원가입"} {" "}
      </button>
      {/* 🚪 로그아웃 버튼 (로그인 상태일 때만 표시) */}
      {isLoggedIn && (
        <button
          className="logout-button"
          onClick={handleLogoutClick}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "8px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      )}
      <h2>🧭 메뉴</h2>{" "}
      <nav className="main-nav">
        {/* ⭐️ React Router Link 컴포넌트로 변경 */} {" "}
        <Link to="/my-collection" className="nav-item highlight">
          🚀 내 컬렉션 정리하기{" "}
        </Link>
        <Link to="/board/free">📢 자유게시판</Link>{" "}
        <Link to="/board/review">⭐ 리뷰 게시판</Link>{" "}
      </nav>
       {" "}
    </div>
  );
};

export default Sidebar;
