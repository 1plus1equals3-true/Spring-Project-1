import React, { useState, useEffect } from "react";
// 조합할 레이아웃 및 섹션 컴포넌트 import
import MainLayout from "../components/layout/MainLayout";
import PostListSection from "../components/sections/HomeListSection";
import PostFreeSection from "../components/sections/HomeFreeSection";
import PostNoticeSection from "../components/sections/HomeNoticeSection";
import ReviewCardSection from "../components/sections/ReviewCardSection";
import apiClient from "../api/apiClient";
import axios from "axios";
import { Archive, Loader2, AlertCircle } from "lucide-react";

import "../styles/main.css";

// 1-1. 백엔드에서 받는 개별 게시물 항목의 타입
interface BoardItemResponse {
  idx: number;
  title: string;
  regdate: string; // item.regdate의 'regdate' 필드 정의
  // 다른 필드가 있다면 여기에 추가
}

// 1-2. Spring Data JPA Page 응답 전체 구조 타입
// API 응답은 { content: BoardItemResponse[], totalPages: number, ... } 형태일 것으로 가정
interface BoardListResponse {
  content: BoardItemResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  // 기타 페이지 관련 필드...
}

// 🚨 데이터 구조 정의 및 빈 배열로 초기화
interface BoardItem {
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

const noticeData: BoardItem[] = [
  // { id: 1, title: "[필독] 개인정보 처리방침 개정 안내", date: "2025.10.29" },
  // { id: 2,title: "서버 점검 및 업데이트 일정 공지 (11/5)",date: "2025.10.25", },
];
const myCollectionData: BoardItem[] = [];
const freeBoardData: BoardItem[] = [];
const bestReviewData: ReviewCard[] = [];

// ==============================================================

const initialBoardData: BoardItem[] = [];
const initialReviewData: ReviewCard[] = [];

const Home: React.FC = () => {
  const [noticeData, setNoticeData] = useState<BoardItem[]>(initialBoardData);
  const [myCollectionData, setMyCollectionData] =
    useState<BoardItem[]>(initialBoardData); // 임시 데이터
  const [freeBoardData, setFreeBoardData] =
    useState<BoardItem[]>(initialBoardData);
  const [bestReviewData, setBestReviewData] =
    useState<ReviewCard[]>(initialReviewData); // 임시 데이터

  // 공지사항 상태
  const [isLoadingNotices, setIsLoadingNotices] = useState<boolean>(true);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  // 🚨 자유게시판 상태 추가
  const [isLoadingFreeBoards, setIsLoadingFreeBoards] = useState<boolean>(true);
  const [freeBoardError, setFreeBoardError] = useState<string | null>(null);

  // 1. 공지사항 데이터 (최신 5개) 호출 함수
  const fetchNotices = async () => {
    setIsLoadingNotices(true);
    setNoticeError(null);
    try {
      // 🚨 API 호출: 최신 5개만 요청
      const response = await apiClient.get<BoardListResponse>(
        `/api/v1/board/list?type=NOTICE&size=5&page=0`
      );

      const fetchedData: BoardItemResponse[] = response.data.content || [];

      setNoticeData(
        fetchedData.map((item) => ({
          id: item.idx,
          title: item.title,
          // item.regdate이 ISO String 형태라고 가정하고 날짜 포맷팅
          date: item.regdate
            ? item.regdate.slice(0, 1) +
              "-" +
              item.regdate.slice(1, 2) +
              "-" +
              item.regdate.slice(2, 3)
            : new Date().toISOString().slice(0, 3),
        }))
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setNoticeError(
          // 오류 응답 구조에 따라 메시지를 추출하도록 수정
          (err.response?.data as { message?: string })?.message ||
            "공지사항 로드 중 오류가 발생했습니다."
        );
      } else {
        setNoticeError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setIsLoadingNotices(false);
    }
  };

  // 🚨 2. 자유게시판 데이터 (최신 5개) 호출 함수 추가
  const fetchFreeBoards = async () => {
    setIsLoadingFreeBoards(true);
    setFreeBoardError(null);
    try {
      // type=FREE로 호출
      const response = await apiClient.get<BoardListResponse>(
        `/api/v1/board/list?type=FREE&size=5&page=0`
      );

      const fetchedData: BoardItemResponse[] = response.data.content || [];

      setFreeBoardData(
        fetchedData.map((item) => ({
          id: item.idx,
          title: item.title,
          date: item.regdate
            ? item.regdate.slice(0, 1) +
              "-" +
              item.regdate.slice(1, 2) +
              "-" +
              item.regdate.slice(2, 3)
            : new Date().toISOString().slice(0, 3),
        }))
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFreeBoardError(
          (err.response?.data as { message?: string })?.message ||
            "자유게시판 로드 중 오류가 발생했습니다."
        );
      } else {
        setFreeBoardError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setIsLoadingFreeBoards(false);
    }
  };

  // 2. 컴포넌트 마운트 시 공지사항 데이터 로드
  useEffect(() => {
    fetchNotices();
    fetchFreeBoards();
    // 🚨 다른 섹션 데이터도 여기서 호출하는 로직을 추가
  }, []);

  // 4. 공지사항 섹션 렌더링 (로딩/오류 포함)
  const renderNoticeSection = () => {
    if (isLoadingNotices) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mr-3" />
          <p className="text-gray-600">공지사항 로딩 중...</p>
        </div>
      );
    }

    if (noticeError) {
      return (
        <div className="bg-red-50 border border-red-300 rounded-xl shadow-lg p-6 mb-6 w-full">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0" />
            <p className="font-medium">공지사항 로드 실패: {noticeError}</p>
            <button
              onClick={fetchNotices}
              className="ml-auto px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
            >
              재시도
            </button>
          </div>
        </div>
      );
    }

    return (
      <PostNoticeSection
        title="📣 공지사항"
        data={noticeData}
        fullWidth={true}
      />
    );
  };

  // 🚨 5. 자유게시판 섹션 렌더링 (로딩/오류 포함)
  const renderFreeBoardSection = () => {
    if (isLoadingFreeBoards) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mr-3" />
          <p className="text-gray-600">자유게시판 로딩 중...</p>
        </div>
      );
    }

    if (freeBoardError) {
      return (
        <div className="bg-red-50 border border-red-300 rounded-xl shadow-lg p-6 w-full h-full">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0" />
            <p className="font-medium">
              자유게시판 로드 실패: {freeBoardError}
            </p>
            <button
              onClick={fetchFreeBoards}
              className="ml-auto px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
            >
              재시도
            </button>
          </div>
        </div>
      );
    }

    return (
      <PostFreeSection
        title="💬 자유게시판 최신글"
        data={freeBoardData}
        fullWidth={false}
      />
    );
  };

  return (
    // 실제 랜더링
    <MainLayout>
      <p>나만의 컬렉션을 정리하고, 자유롭게 이야기를 나눠보세요!</p>

      <div className="content-grid">
        {/* 1. 공지사항 (Full Width) */}
        {renderNoticeSection()}

        {/* 2. 최근 수정한 내 컬렉션 (Half Width) */}
        <PostListSection
          title="✏️ 최근 수정한 내 컬렉션"
          data={myCollectionData}
          fullWidth={false}
        />

        {/* 3. 자유게시판 최신글 */}
        {renderFreeBoardSection()}

        {/* 4. 베스트 컬렉션 리뷰 (Full Width) */}
        <ReviewCardSection data={bestReviewData} />
      </div>
    </MainLayout>
  );
};

export default Home;
