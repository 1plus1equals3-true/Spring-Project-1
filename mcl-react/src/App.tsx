import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import OAuthRedirectHandler from "./components/auth/OauthRedirectHandler";
import { AuthProvider } from "./context/AuthContext";
import SignupPage from "./pages/SignupPage";
import SignupSuccessPage from "./pages/SignupSuccessPage";
import MyPage from "./pages/Mypage";
import NoticePage from "./pages/NoticePage";
import FreeBoardPage from "./pages/FreeBoardPage";
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardEditorPage from "./pages/BoardEditorPage";

import "./styles/main.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/board/notice" element={<NoticePage />} />
          <Route path="/board/free" element={<FreeBoardPage />} />
          <Route path="/board/:type/write" element={<BoardEditorPage />} />
          <Route path="/board/:type/:id/edit" element={<BoardEditorPage />} />
          <Route path="/board/:type/:id" element={<BoardDetailPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />
          <Route path="/oauth/callback" element={<OAuthRedirectHandler />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
