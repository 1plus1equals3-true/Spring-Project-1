import React from "react";
// 조합할 레이아웃 및 섹션 컴포넌트 import
import MainLayout from "../components/layout/MainLayout";
import PostListSection from "../components/sections/PostListSection";
import ReviewCardSection from "../components/sections/ReviewCardSection";
// ⭐️ 스타일 파일은 App.tsx 또는 index.tsx에서 전역으로 import하거나,
//    Home.tsx에서만 사용할 경우 아래처럼 import합니다.
import "../styles/main.css";

// 🚨 데이터 구조 정의 및 빈 배열로 초기화 (더미데이터 제거 요청 반영)
interface PostItem {
  id: number;
  title: string;
  date: string;
}
interface ReviewCard {
  id: number;
  rank: string;
  title: string;
  info: string;
}

const noticeData: PostItem[] = [
  // { id: 1, title: "[필독] 개인정보 처리방침 개정 안내", date: "2025.10.29" },
  // { id: 2, title: "서버 점검 및 업데이트 일정 공지 (11/5)", date: "2025.10.25" },
];
const myCollectionData: PostItem[] = [];
const freeBoardData: PostItem[] = [];
const bestReviewData: ReviewCard[] = [];

const Home: React.FC = () => {
  return (
    // MainLayout으로 감싸서 일관된 레이아웃 구조를 적용합니다.
    <MainLayout>
      <p>나만의 컬렉션을 정리하고, 자유롭게 이야기를 나눠보세요!</p>

      <div className="content-grid">
        {/* 1. 공지사항 (Full Width) - NoticeSection 컴포넌트로 분리 가능 */}
        <PostListSection
          title="📣 공지사항"
          data={noticeData}
          fullWidth={true}
        />

        {/* 2. 최근 수정한 내 컬렉션 (Half Width) */}
        <PostListSection
          title="✏️ 최근 수정한 내 컬렉션"
          data={myCollectionData}
          fullWidth={false}
        />

        {/* 3. 자유게시판 최신글 (Half Width) */}
        <PostListSection
          title="💬 자유게시판 최신글"
          data={freeBoardData}
          fullWidth={false}
        />

        {/* 4. 베스트 컬렉션 리뷰 (Full Width) */}
        <ReviewCardSection data={bestReviewData} />
      </div>
    </MainLayout>
  );
};

export default Home;
