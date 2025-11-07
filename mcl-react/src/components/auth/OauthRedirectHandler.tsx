// src/components/auth/OauthRedirectHandler.tsx

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OauthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // 1. URLSearchParams를 사용하여 쿼리 파라미터 파싱
    const searchParams = new URLSearchParams(location.search);

    // 2. 토큰(성공여부) 및 닉네임 추출
    const success = searchParams.get("token");
    const nickname = searchParams.get("nickname");

    if (success) {
      console.log("소셜 로그인 성공.");

      let decodedNickname = null;
      if (nickname) {
        decodedNickname = decodeURIComponent(nickname);
        console.log("닉네임 저장 완료:", decodedNickname);
      }

      // ⭐️ Context의 login 함수 호출 (닉네임 저장 및 상태 업데이트)
      if (decodedNickname) {
        login(decodedNickname);
      }
      // 4. 메인 페이지로 리다이렉트

      alert("로그인에 성공했습니다! 메인 페이지로 이동합니다.");
      navigate("/", { replace: true });
    } else {
      // 토큰이 부족하거나 없는 경우
      console.error("로그인 실패: 필요한 모든 토큰이 URL에 없습니다.");
      alert("소셜 로그인에 실패했습니다. 다시 시도해 주세요.");
      navigate("/login", { replace: true });
    }
  }, [location, navigate, login]); // 사용자가 리다이렉트되는 동안 로딩 화면을 보여줍니다.

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>로그인 처리 중...</h2>      <p>잠시만 기다려 주세요.</p>   {" "}
    </div>
  );
};

export default OauthRedirectHandler;
