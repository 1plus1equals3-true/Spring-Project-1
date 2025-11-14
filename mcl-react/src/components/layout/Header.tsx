import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  // 모바일/태블릿에서 숨겨지고, 데스크탑에서 고정 헤더로 사용됨
  return (
    <header>
      <div className="container">
        <h1>
          <Link to="/" className="logo">
            My Collection Log 📚
          </Link>
        </h1>
        {/* 모바일/태블릿용 기본 내비게이션은 데스크탑에서 숨김 처리됨 */}
        {/* <nav className="main-nav">...</nav> */}
      </div>
    </header>
  );
};

export default Header;
