// src/components/auth/OauthRedirectHandler.tsx

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OauthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. URLSearchParams를 사용하여 쿼리 파라미터 파싱
    const searchParams = new URLSearchParams(location.search); // 2. 토큰 및 닉네임 추출 (리프레시 토큰 추가)

    const accessToken = searchParams.get("token"); // 액세스 토큰
    const refreshToken = searchParams.get("refreshToken"); // 🔑 리프레시 토큰 추가
    const nickname = searchParams.get("nickname"); // 백엔드에서 인코딩되어 전달됨 // 🔑 두 토큰이 모두 존재하는지 확인

    if (accessToken && refreshToken) {
      console.log("인증 토큰 및 리프레시 토큰 발견."); // 3. 토큰들을 localStorage에 저장 (또는 쿠키/세션 스토리지 사용)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken); // 🔑 리프레시 토큰 저장
      console.log("Access/Refresh 토큰 저장 완료."); // 닉네임도 저장 (옵션)

      if (nickname) {
        const decodedNickname = decodeURIComponent(nickname);
        localStorage.setItem("userNickname", decodedNickname);
        console.log("닉네임 저장 완료:", decodedNickname);
      } // 4. 메인 페이지로 리다이렉트

      // 🚨 TODO: 전역 인증 상태 관리 (Context/Redux) 로직을 여기에 추가해야 합니다.

      alert("로그인에 성공했습니다! 메인 페이지로 이동합니다.");
      navigate("/", { replace: true }); // replace를 사용하여 뒤로가기 방지
    } else {
      // 토큰이 부족하거나 없는 경우
      console.error("로그인 실패: 필요한 모든 토큰이 URL에 없습니다.");
      alert("소셜 로그인에 실패했습니다. 다시 시도해 주세요.");
      navigate("/login", { replace: true });
    }
  }, [location, navigate]); // 사용자가 리다이렉트되는 동안 로딩 화면을 보여줍니다.

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>로그인 처리 중...</h2>      <p>잠시만 기다려 주세요.</p>   {" "}
    </div>
  );
};

export default OauthRedirectHandler;
