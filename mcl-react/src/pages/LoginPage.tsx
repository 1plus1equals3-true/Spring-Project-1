import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/defaultconfig";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth(); // ⭐️ AuthContext에서 refreshUser 함수 가져오기

  // 1. 아이디와 비밀번호 상태 관리
  const [userid, setUserid] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(""); // 오류 메시지 상태

  const handleSocialLogin = (provider: string) => {
    // 소셜 로그인은 백엔드로 바로 리다이렉션
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  // 2. 로컬 로그인 폼 제출 핸들러 (API 연동)
  const handleLocalLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // 기존 오류 메시지 초기화

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        { userid, pwd }, // JSON 형식으로 아이디/비밀번호 전송
        {
          headers: {
            "Content-Type": "application/json",
          },
          // JWT 토큰이 HttpOnly 쿠키로 오기 때문에, withCredentials는 필수
          withCredentials: true,
        }
      );

      // HTTP 상태 코드 200 (OK)
      if (response.status === 200) {
        // ⭐️ 기존: 닉네임 헤더 추출 및 login(nickname) 호출 로직 제거
        // 토큰이 HttpOnly 쿠키로 성공적으로 설정되었으므로,
        // Context의 refreshUser 함수를 호출하여 /me API로 사용자 정보를 로드하고 상태를 업데이트합니다.
        await refreshUser();

        // 3. 홈 페이지로 이동
        navigate("/");
      }
    } catch (error) {
      // 4. 로그인 실패 처리
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;

        if (status === 401) {
          // 401 Unauthorized (아이디/비밀번호 불일치)
          setError(
            (error.response.data as any)?.message ||
              "아이디 또는 비밀번호가 일치하지 않습니다."
          );
        } else {
          setError("로그인 서버 오류가 발생했습니다.");
        }
      } else {
        setError("네트워크 연결을 확인해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div
        style={{
          maxWidth: "400px",
          margin: "80px auto",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#007bff" }}>로그인</h1>
        <p style={{ textAlign: "center", marginBottom: "30px", color: "#666" }}>
          소셜 계정 또는 자체 계정으로 로그인해 주세요.
        </p>

        {/* 1. 소셜 로그인 버튼 */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={() => handleSocialLogin("naver")}
            style={{
              width: "100%",
              padding: "15px",
              marginBottom: "10px",
              backgroundColor: "#03C75A",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Naver 로그인
          </button>
          <button
            onClick={() => handleSocialLogin("kakao")}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#FEE500",
              color: "#3C1E1E",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Kakao 로그인
          </button>
        </div>

        <hr
          style={{ margin: "30px 0", border: "0", borderTop: "1px solid #eee" }}
        />

        {/* 2. 로컬 로그인 폼 */}
        <form onSubmit={handleLocalLoginSubmit}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "1.2em",
              marginBottom: "20px",
            }}
          >
            자체 계정 로그인
          </h2>

          {/* 3. 아이디 입력 필드 (상태 연동) */}
          <input
            type="text"
            placeholder="아이디"
            required
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            style={inputStyle}
          />

          {/* 4. 비밀번호 입력 필드 (상태 연동) */}
          <input
            type="password"
            placeholder="비밀번호"
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            style={inputStyle}
          />

          {/* 5. 에러 메시지 표시 */}
          {error && (
            <p
              style={{
                color: "red",
                fontSize: "0.9em",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? "#ccc" : "#007bff",
            }}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p
          style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9em" }}
        >
          계정이 없으신가요?{" "}
          <a
            onClick={() => navigate("/signup")}
            style={{
              color: "#007bff",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

// 💡 재사용 가능한 스타일 (컴포넌트 하단에 정의)
const inputStyle: React.CSSProperties = {
  width: "calc(100%)",
  margin: "5px 0",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  boxSizing: "border-box", // 패딩이 너비에 포함되도록 설정
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  margin: "15px 0 10px 0",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};
