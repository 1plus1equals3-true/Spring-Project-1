import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import OAuthRedirectHandler from "./components/auth/OauthRedirectHandler";

import "./styles/main.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 🔑 콜백 경로 설정: 백엔드가 이 경로로 JWT를 담아 리다이렉트합니다. */}
        <Route path="/oauth/callback" element={<OAuthRedirectHandler />} />

        {/* <Route path="/oauth/callback/:provider" element={<OAuthRedirectHandler />} /> */}
        {/* 만약 Naver/Kakao 등 제공자 정보가 필요하다면 위처럼 경로를 설정할 수도 있습니다. */}

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
