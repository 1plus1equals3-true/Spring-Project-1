import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "./api/apiClient";
import axios, { AxiosError } from "axios";

// 임시 컴포넌트
const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // ⭐️ 로컬 스토리지에서 닉네임 유무를 초기 상태로 설정
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userNickname")
  ); // ⭐️ 닉네임 파싱 및 저장 로직

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nickname = params.get("nickname");

    if (nickname) {
      // 닉네임 저장
      localStorage.setItem("userNickname", decodeURIComponent(nickname));
      console.log(
        "메인 페이지에서 닉네임 저장 완료:",
        decodeURIComponent(nickname)
      );

      // ⭐️ 로컬 상태 업데이트 -> APITest에 전달되어 리렌더링 유도
      setIsLoggedIn(true); // URL에서 쿼리 파라미터를 제거

      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>컬렉션 커뮤니티 메인</h1> <p>환영합니다!</p>
      <AuthButtons />
      <APITest isLoggedIn={isLoggedIn} /> {/* ⭐️ 상태 전달 */} {" "}
    </div>
  );
};

const Login = () => (
  <div>
    <h2>로그인 페이지</h2>
    <AuthButtons />
  </div>
);

// 🔐 보호된 페이지 컴포넌트 수정
const Protected = () => {
  // 💡 로그인 상태를 닉네임 존재 여부로 간접적으로 확인합니다.
  const nickname = localStorage.getItem("userNickname");

  // 💡 백엔드 로그아웃 API 호출을 위한 함수 (쿠키 삭제)
  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청 (백엔드가 쿠키를 지우는 응답을 보냄)
      // ⭐️ 이 API는 백엔드에서 구현해야 합니다 (예: /api/v1/auth/logout 엔드포인트)
      await apiClient.post("/api/v1/auth/logout");

      // 프론트엔드에서 저장한 닉네임만 제거
      localStorage.removeItem("userNickname");
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 강제로 닉네임만 지우고 리로드 (비상 조치)
      localStorage.removeItem("userNickname");
      window.location.reload();
    }
  };

  return nickname ? ( // 닉네임 존재 여부로 로그인 상태 간접 확인
    <div>
      <h1>🔐 보호된 페이지</h1> <p>{nickname}님, 로그인 상태입니다.</p>{" "}
      <button onClick={handleLogout}> 로그아웃 </button>{" "}
    </div>
  ) : (
    <div>
      <p>로그인이 필요합니다.</p> <Link to="/login">로그인하기</Link>{" "}
    </div>
  );
};

// 🔑 API 테스트 컴포넌트 수정
const APITest = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const testAuthApi = async () => {
    try {
      // apiClient를 사용하면 브라우저가 HttpOnly 쿠키(AccessToken)를 자동으로 헤더에 포함합니다.
      const response = await apiClient.get("/api/v1/user/info");
      // ⭐️ 토큰 관련 코드를 모두 제거합니다.
      alert(`인증 API 호출 성공:\n${response.data}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("인증 API 호출 실패:", error.response || error.message);
        alert(
          "인증 API 호출 실패! 쿠키가 유효하지 않거나 만료되었습니다. (콘솔 확인)"
        );
      } else {
        console.error("인증 API 호출 중 알 수 없는 오류 발생:", error);
        alert("알 수 없는 오류가 발생했습니다. 콘솔을 확인하세요.");
      }
    }
  };

  return (
    <div
      style={{ marginTop: "20px", border: "1px solid #ddd", padding: "15px" }}
    >
      <h3>API 인증 테스트</h3>{" "}
      <button
        onClick={testAuthApi} // 💡 prop으로 받은 상태로 활성화 판단
        disabled={!isLoggedIn}
      >
          🔐 인증된 API (/api/v1/user/info) 호출{" "}
      </button>{" "}
      <p style={{ marginTop: "10px", fontSize: "12px" }}>
          (로그인 후 닉네임이 저장되어야 활성화됩니다.){" "}
      </p>{" "}
         {" "}
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
      href="http://localhost:8080/oauth2/authorization/naver"
      style={{ marginRight: "10px" }}
    >
      <button>네이버로 로그인</button>
    </a>
    <a href="http://localhost:8080/oauth2/authorization/kakao">
      <button>카카오로 로그인</button>
    </a>
  </div>
);

// 💡 헬퍼 함수: 쿠키에서 특정 값을 가져옵니다.
// HttpOnly 쿠키는 이 함수로 접근 불가능하지만, 닉네임 등을 일반 쿠키로 저장했다면 사용 가능
const getCookie = (name: string): string | null => {
  const value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? value[2] : null;
};

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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
