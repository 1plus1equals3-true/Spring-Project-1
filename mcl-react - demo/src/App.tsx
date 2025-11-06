import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import OAuthRedirectHandler from "./pages/OAuthRedirectHandler";
import apiClient from "./api/apiClient";
import axios, { AxiosError } from "axios";

// 임시 컴포넌트
const Main = () => (
  <div>
    <h1>MCL</h1>
    <p>
      -note- <br /> <br />
      네이버 로그인, 카카오 로그인 시 JWT 토큰 생성 <br />
      로컬스토리지 → 쿠키 httponry 속성 사용으로 변경 및 리프레시 토큰과 엑세스
      토큰 구분하여 보안 강화 <br />
      메인페이지와 로그인페이지 만드는중
    </p>
    <AuthButtons />
    <APITest />
  </div>
);
const Login = () => (
  <div>
    <h2>로그인 페이지</h2>
    <AuthButtons />
  </div>
);
const Protected = () => {
  const token = localStorage.getItem("accessToken");
  return token ? (
    <div>
      <h1>🔐 보호된 페이지</h1>
      <p>로그인 상태입니다.</p>
      <button
        onClick={() => {
          localStorage.removeItem("accessToken");
          window.location.reload();
        }}
      >
        로그아웃
      </button>
    </div>
  ) : (
    <div>
      <p>로그인이 필요합니다.</p>
      <Link to="/login">로그인하기</Link>
    </div>
  );
};

const APITest = () => {
  const testAuthApi = async () => {
    try {
      // apiClient를 사용하여 요청 시 JWT 토큰이 자동으로 헤더에 추가됩니다.
      const response = await apiClient.get("/api/v1/user/info");
      alert(`인증 API 호출 성공:\n${response.data}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // error가 AxiosError임을 확인했으므로, error.response에 접근 가능
        console.error("인증 API 호출 실패:", error.response || error.message);

        alert(
          "인증 API 호출 실패! 토큰이 유효하지 않거나 만료되었습니다. (콘솔 확인)"
        );
      } else {
        // 기타 알 수 없는 오류
        console.error("인증 API 호출 중 알 수 없는 오류 발생:", error);
        alert("알 수 없는 오류가 발생했습니다. 콘솔을 확인하세요.");
      }
    }
  };

  return (
    <div
      style={{ marginTop: "20px", border: "1px solid #ddd", padding: "15px" }}
    >
      <h3>API 인증 테스트</h3>
      <button
        onClick={testAuthApi}
        disabled={!localStorage.getItem("accessToken")}
      >
        🔐 인증된 API (/api/v1/user/info) 호출
      </button>
      <p style={{ marginTop: "10px", fontSize: "12px" }}>
        (토큰이 localStorage에 있어야 활성화됩니다.)
      </p>
    </div>
  );
};

// 소셜 로그인 버튼 컴포넌트
const AuthButtons = () => (
  <div style={{ marginTop: "20px" }}>
    <h3>소셜 로그인</h3>
    {/*
            백엔드 Spring Security가 제공하는 OAuth2 시작 엔드포인트로 연결합니다.
            React 개발 서버의 URL이 아닌, 백엔드 서버의 URL로 직접 이동해야 합니다.
        */}
    <a
      href="http://192.168.0.190:8071/oauth2/authorization/naver"
      style={{ marginRight: "10px" }}
    >
      <button>네이버로 로그인</button>
    </a>
    <a href="http://192.168.0.190:8071/oauth2/authorization/kakao">
      <button>카카오로 로그인</button>
    </a>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <nav style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
        <Link to="/" style={{ marginRight: "10px" }}>
          메인
        </Link>
        <Link to="/login" style={{ marginRight: "10px" }}>
          로그인
        </Link>
        <Link to="/protected">보호된 페이지 (테스트)</Link>
      </nav>
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/protected" element={<Protected />} />

          {/* ⭐️ 백엔드의 성공 핸들러가 토큰을 리다이렉트하는 경로 */}
          <Route path="/oauth/redirect" element={<OAuthRedirectHandler />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
