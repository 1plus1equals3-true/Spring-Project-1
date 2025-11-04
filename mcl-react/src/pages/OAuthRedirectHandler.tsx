import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. URLSearchParams를 사용하여 쿼리 파라미터에서 토큰과 닉네임 추출
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const nickname = params.get("nickname");

    if (token) {
      // 2. JWT 토큰을 안전하게 저장 (LocalStorage 사용)
      localStorage.setItem("accessToken", token);

      // 3. 사용자 정보 저장 (선택 사항)
      if (nickname) {
        localStorage.setItem("userNickname", nickname);
      }

      // 4. 로그인 성공 후 메인 페이지 또는 대시보드로 이동
      alert(`${nickname}님, 환영합니다! 로그인이 완료되었습니다.`);
      navigate("/"); // 메인 페이지로 이동
    } else {
      // 토큰이 없는 경우 (로그인 실패 또는 오류 발생)
      alert("소셜 로그인에 실패했습니다. 다시 시도해 주세요.");
      navigate("/login"); // 로그인 페이지로 이동
    }
  }, [location, navigate]);

  // 토큰 처리 중 로딩 화면을 보여줍니다.
  return <div>로그인 처리 중... 잠시만 기다려 주세요.</div>;
};

export default OAuthRedirectHandler;
