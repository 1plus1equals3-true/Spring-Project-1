import React from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-wrapper">
      {/* 1. 고정된 사이드바 */}{" "}
      {/* ⭐️ Sidebar에 prop을 전달하지 않고, Sidebar 내부에서 useAuth() 사용 */}
      <Sidebar /> {/* 2. 콘텐츠 영역 */}{" "}
      <div className="content-area">
        {/* 고정된 헤더 (데스크탑에서만 보임) */}
        <Header /> {/* 실제 페이지 내용 */}{" "}
        <div className="container">{children}</div>{" "}
      </div>{" "}
    </div>
  );
};

export default MainLayout;
