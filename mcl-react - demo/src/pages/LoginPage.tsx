// src/pages/LoginPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} 소셜 로그인 API 호출 (TODO)`);
    // 실제로는 백엔드의 OAuth2 인증 엔드포인트로 리다이렉트
    // window.location.href = `https://localhost:8443/oauth2/authorization/${provider}`;
  };

  // 이 폼은 로컬 로그인을 위한 폼이며, 나중에 API와 연결해야 합니다.
  const handleLocalLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("로컬 로그인 시도 (TODO: API 연동)");
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
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
          N Naver로 로그인
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
          K Kakao로 로그인
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
        <input
          type="text"
          placeholder="아이디"
          required
          style={{
            width: "calc(100% - 22px)",
            margin: "5px 0",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          required
          style={{
            width: "calc(100% - 22px)",
            margin: "5px 0",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            margin: "15px 0 10px 0",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          로그인
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9em" }}>
        계정이 없으신가요?{" "}
        <a href="/signup" style={{ color: "#007bff", textDecoration: "none" }}>
          회원가입
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
