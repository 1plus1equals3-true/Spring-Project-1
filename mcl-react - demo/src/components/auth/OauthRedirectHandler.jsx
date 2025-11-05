import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OauthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. URLSearchParams를 사용하여 쿼리 파라미터 파싱
    const searchParams = new URLSearchParams(location.search);

    // 2. JWT 토큰 및 닉네임 추출
    const token = searchParams.get("token");
    const nickname = searchParams.get("nickname"); // 이미 백엔드에서 인코딩되어 전달됨

    if (token) {
      // 3. 토큰을 localStorage에 저장 (보안 고려하여 쿠키 사용도 고려 가능)
      localStorage.setItem("accessToken", token);
      console.log("JWT 토큰 저장 완료:", token);

      // 닉네임도 저장 (옵션)
      if (nickname) {
        // 백엔드에서 인코딩된 닉네임을 다시 디코딩
        const decodedNickname = decodeURIComponent(nickname);
        localStorage.setItem("userNickname", decodedNickname);
        console.log("닉네임 저장 완료:", decodedNickname);
      }

      // 4. 메인 페이지 또는 로그인 완료 페이지로 리다이렉트 (예: '/')
      // 로그인 상태를 관리하는 전역 상태(Context/Redux)를 업데이트하는 로직이 여기에 추가될 수 있습니다.
      navigate("/");
    } else {
      // 토큰이 없는 경우 (로그인 실패 또는 오류)
      console.error("로그인 실패: 토큰이 URL에 없습니다.");
      alert("소셜 로그인에 실패했습니다. 다시 시도해 주세요.");
      navigate("/login"); // 로그인 페이지로 돌려보냅니다.
    }
  }, [location, navigate]);

  // 사용자가 리다이렉트되는 동안 로딩 화면을 보여줍니다.
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>로그인 처리 중...</h2>
      <p>잠시만 기다려 주세요.</p>
      {/*  */}
    </div>
  );
};

export default OauthRedirectHandler;
