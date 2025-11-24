// components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

import "../../styles/ProtectedRoute.css";

interface ProtectedRouteProps {
  requireAdmin?: boolean; // 관리자 권한이 필요한지?
  requireAuth?: boolean; // 로그인이 필요한지? (기본값 true)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAdmin = false,
  requireAuth = true,
}) => {
  const { user, isLoading } = useAuth();
  const { type } = useParams<{ type: string }>(); // URL 파라미터 확인 (/board/:type/write)

  // 1. 로딩 중일 때는 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="loading-spinner" size={48} />
      </div>
    );
  }

  // 2. 로그인이 필요한데 유저가 없다면 -> 로그인 페이지로
  if (requireAuth && !user) {
    alert("로그인이 필요한 서비스입니다.");
    return <Navigate to="/login" replace />;
  }

  // 3. 관리자 권한이 필요한데 등급이 낮다면 -> 홈으로
  if (requireAdmin && user && user.grade < 9) {
    alert("관리자만 접근할 수 있습니다.");
    return <Navigate to="/" replace />;
  }

  // ⭐️ 4. [심화] 공지사항 작성 페이지 특수 조건 처리
  // URL이 /board/notice/... 인데 관리자가 아니라면?
  if (type?.toUpperCase() === "NOTICE" && user && user.grade < 9) {
    alert("공지사항은 관리자만 작성할 수 있습니다.");
    return <Navigate to="/board/notice" replace />;
  }

  // 5. 모든 검사를 통과하면 자식 라우트(실제 페이지)를 보여줌
  return <Outlet />;
};

export default ProtectedRoute;
