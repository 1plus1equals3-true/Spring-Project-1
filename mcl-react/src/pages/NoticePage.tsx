import React from "react";
import MainLayout from "../components/layout/MainLayout";
import CommonBoard from "../components/sections/CommonBoard";

const NoticePage: React.FC = () => {
  return (
    <MainLayout>
      <CommonBoard
        title="📢 공지사항"
        description="서비스의 주요 업데이트 및 점검 일정을 확인하세요."
        boardType="NOTICE"
      />
    </MainLayout>
  );
};

export default NoticePage;
