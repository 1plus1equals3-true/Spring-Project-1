import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

// PageContent는 Home.tsx나 다른 페이지의 실제 내용이 들어갈 자리입니다.
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // 🚨 임시 로그인 상태 (실제는 Context API 또는 Redux에서 가져와야 합니다.)
  const isLoggedIn = false;

  return (
    <div className="main-wrapper">
      {/* 1. 고정된 사이드바 */}
      <Sidebar isLoggedIn={isLoggedIn} />

      {/* 2. 콘텐츠 영역 */}
      <div className="content-area">
        {/* 고정된 헤더 (데스크탑에서만 보임) */}
        <Header />

        {/* 실제 페이지 내용 */}
        <div className="container">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
