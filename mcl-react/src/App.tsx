import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // SecurityConfig같은 라이터 설정

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
import PokeSampleEditorPage from "./pages/PokeSampleEditorPage";
import PokeSampleListPage from "./pages/PokeSampleListPage";
import PokeSampleDetailPage from "./pages/PokeSampleDetailPage";
import MyCollectionPage from "./pages/MyCollectionPage";

import "./styles/main.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==========================================
              1. 누구나 접근 가능한 공개 페이지 (Public)
          ========================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />
          <Route path="/oauth/callback" element={<OAuthRedirectHandler />} />

          {/* 게시판 목록 및 상세 조회는 비회원도 가능 */}
          <Route path="/board/notice" element={<NoticePage />} />
          <Route path="/board/free" element={<FreeBoardPage />} />
          <Route path="/board/:type/:id" element={<BoardDetailPage />} />

          {/* 샘플 목록 및 상세 조회는 비회원도 가능 */}
          <Route path="/poke-sample/list/" element={<PokeSampleListPage />} />
          <Route path="/poke-sample/:id" element={<PokeSampleDetailPage />} />

          {/* ==========================================
              2. 로그인한 유저만 접근 가능한 페이지 (User)
          ========================================== */}
          <Route element={<ProtectedRoute requireAuth={true} />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route
              path="/poke-sample/write"
              element={<PokeSampleEditorPage />}
            />
            <Route
              path="/poke-sample/:id/edit"
              element={<PokeSampleEditorPage />}
            />
            <Route path="/my-collection" element={<MyCollectionPage />} />

            {/* 작성 페이지의 공지 여부는 자동으로 검사 */}
            <Route path="/board/:type/write" element={<BoardEditorPage />} />
            <Route path="/board/:type/:id/edit" element={<BoardEditorPage />} />
          </Route>

          {/* ==========================================
              3. 관리자 전용 페이지 (Admin)
          ========================================== */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            {/* 예시: <Route path="/admin/stats" element={<AdminStatsPage />} /> */}
          </Route>

          {/* ==========================================
              4. 404 페이지
          ========================================== */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
