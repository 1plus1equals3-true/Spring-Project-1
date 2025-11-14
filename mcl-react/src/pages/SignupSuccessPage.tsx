import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";

const SignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  // 3초 후 로그인 페이지로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <Header />
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>회원가입이 완료되었습니다!</h1>
          <p style={messageStyle}>
            멤버가 되신 것을 환영합니다.
            <br />
            5초 후 로그인 페이지로 자동 이동합니다.
          </p>
          <button onClick={() => navigate("/login")} style={buttonStyle}>
            지금 로그인하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccessPage;

// 💡 스타일 정의
const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
  textAlign: "center",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "400px",
  padding: "40px",
  backgroundColor: "#fff",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const titleStyle: React.CSSProperties = {
  color: "#28a745",
  marginBottom: "15px",
  fontSize: "1.8em",
};

const messageStyle: React.CSSProperties = {
  color: "#555",
  marginBottom: "30px",
  lineHeight: "1.5",
  fontSize: "1em",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 25px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.3s",
};
