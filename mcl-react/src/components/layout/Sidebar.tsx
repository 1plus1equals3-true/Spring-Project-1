import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { UserInfo } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import {
  API_BASE_URL,
  NOTION_URL,
  PUBLIC_IMAGE_PATH,
} from "../../config/defaultconfig";

const DEFAULT_PROFILE_IMAGE =
  "https://placehold.co/100x100/dddddd/888888?text=P";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  const currentUser: UserInfo | null = user;

  const handleAuthAction = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      // 로그인 상태: 내 정보 페이지로 이동
      navigate("/mypage");
    }
  };

  // 이미지 경로 생성 헬퍼 함수
  const getProfileImageUrl = (imagePath: string | null): string => {
    if (!imagePath) {
      return DEFAULT_PROFILE_IMAGE;
    } // 1. 이미 http/https로 시작하는 절대 URL이라면 그대로 반환
    if (imagePath.startsWith("http")) {
      return imagePath;
    } // 2. API_BASE_URL (백엔드 주소) 정리 (끝 슬래시 제거)

    const baseUrl = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL; // 3. PUBLIC_IMAGE_PATH 정리 (시작 슬래시 확인)
    const publicPath = PUBLIC_IMAGE_PATH.startsWith("/")
      ? PUBLIC_IMAGE_PATH
      : `/${PUBLIC_IMAGE_PATH}`; // 4. imagePath (상대 경로) 정리 (시작 슬래시 제거, 중복 방지)

    const cleanedPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath; // 5. 모든 요소를 결합하여 절대 URL 생성
    return `${baseUrl}${publicPath}/${cleanedPath}`;
  };

  // ⭐️ 로그아웃 버튼 클릭 핸들러
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault(); // href가 있으면 클릭 방지
    logout(); // AuthContext의 logout 함수 호출
  };

  return (
    <div className="sidebar">
      {isLoggedIn && currentUser ? (
        <>
          <div
            onClick={handleAuthAction}
            style={profileAreaStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)")
            }
          >
            <img
              // UserInfo.profileImageUrl 사용
              src={getProfileImageUrl(currentUser.profileImageUrl)}
              alt="프로필 사진"
              style={profileImageStyle}
              onError={(e) => {
                // 이미지 로드 실패 시 플레이스홀더로 대체
                (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <p style={nicknameStyle}>{currentUser.nickname} 님</p>
            <span style={mypageLinkStyle}>내 정보 보기 &gt;</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogoutClick}
            style={logoutButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e53935")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#f44336")
            }
          >
            🚪 로그아웃
          </button>
        </>
      ) : (
        <button
          className="login-button logged-out"
          onClick={handleAuthAction}
          style={{ ...authButtonStyle, marginTop: "10px" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          🔑 로그인 / 회원가입
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
        <a href={`${NOTION_URL}`} target="_blank" rel="noopener noreferrer">
          🌐 노션 바로가기
        </a>
      </nav>
       {" "}
    </div>
  );
};

export default Sidebar;

const profileAreaStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "15px 0",
  marginBottom: "10px",
  cursor: "pointer",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #eee",
  transition: "background-color 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const profileImageStyle: React.CSSProperties = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #007bff",
  marginBottom: "10px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const nicknameStyle: React.CSSProperties = {
  fontWeight: "700",
  fontSize: "1.15em",
  color: "#333",
  marginBottom: "5px",
};

const mypageLinkStyle: React.CSSProperties = {
  fontSize: "0.85em",
  color: "#007bff",
  textDecoration: "underline",
};

const authButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  marginBottom: "10px",
  transition: "background-color 0.2s",
};

const logoutButtonStyle: React.CSSProperties = {
  marginTop: "10px",
  width: "100%",
  padding: "8px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.2s",
};
