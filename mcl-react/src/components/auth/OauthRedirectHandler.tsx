import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OauthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth(); // ⭐️ login 대신 refreshUser 사용

  useEffect(() => {
    // 1. URLSearchParams를 사용하여 쿼리 파라미터 파싱
    const searchParams = new URLSearchParams(location.search);

    // 2. 'token' 파라미터 유무로 로그인 성공 여부 판단 (백엔드가 쿠키를 설정했음을 가정)
    const success = searchParams.get("token");

    if (success) {
      console.log("소셜 로그인 성공, 서버에서 쿠키 설정 완료.");

      // ⭐️ 닉네임 저장 대신, Context의 refreshUser를 호출하여 /me API를 강제로 호출하고 상태를 업데이트합니다.
      refreshUser()
        .then(() => {
          console.log("사용자 정보 로드 완료. 메인 페이지로 이동합니다.");
          // 3. 메인 페이지로 리다이렉트
          navigate("/", { replace: true });
        })
        .catch((error) => {
          // refreshUser가 실패하면 토큰이 유효하지 않거나 /me 호출 실패로 간주
          console.error("사용자 정보 로드 중 오류 발생:", error);
          navigate("/login", { replace: true });
        });
    } else {
      // 토큰이 부족하거나 없는 경우
      console.error("로그인 실패: 필요한 인증 정보가 URL에 없습니다.");
      navigate("/login", { replace: true });
    }
  }, [location, navigate, refreshUser]); // refreshUser를 dependency에 추가

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>로그인 처리 중...</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default OauthRedirectHandler;
