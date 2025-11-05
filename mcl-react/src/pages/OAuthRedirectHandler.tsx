/*
이제 사용하지 않음

import React, { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom"; // useNavigate는 제거 가능
import { useLocation } from "react-router-dom"; // useNavigate 제거

const OAuthRedirectHandler: React.FC = () => {
  // const navigate = useNavigate(); // 사용하지 않으므로 주석 처리 또는 제거
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nickname = params.get("nickname");

    if (nickname) {
      // 닉네임 저장
      localStorage.setItem("userNickname", decodeURIComponent(nickname));
      console.log("로그인 성공! 닉네임:", decodeURIComponent(nickname)); // ⭐️ navigate 대신 window.location.replace 사용: 페이지를 새로고침하며 메인으로 이동

      window.location.replace("/");
    } else {
      // 닉네임이 없거나 오류 발생 시
      window.location.replace("/login");
    } // 의존성 배열에서 navigate 제거
  }, [location]);

  return <div>로그인 처리 중... 잠시만 기다려 주세요.</div>;
};

export default OAuthRedirectHandler;
*/
