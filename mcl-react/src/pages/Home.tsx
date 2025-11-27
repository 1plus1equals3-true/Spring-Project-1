import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import TodayPokemonSection from "../components/sections/TodayPokemonSection";
import PostFreeSection from "../components/sections/HomeFreeSection";
import PostNoticeSection from "../components/sections/HomeNoticeSection";
import BestSampleSection from "../components/sections/BestSampleSection";
import apiClient from "../api/apiClient";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";

import "../styles/main.css";

// --- 타입 정의 (기존 유지) ---
interface BoardItemResponse {
  idx: number;
  title: string;
  regdate: string;
}

interface BoardListResponse {
  content: BoardItemResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface BoardItem {
  id: number;
  title: string;
  date: string;
}

// 초기값
const initialBoardData: BoardItem[] = [];

const Home: React.FC = () => {
  const [noticeData, setNoticeData] = useState<BoardItem[]>(initialBoardData);
  const [freeBoardData, setFreeBoardData] =
    useState<BoardItem[]>(initialBoardData);

  const [isLoadingNotices, setIsLoadingNotices] = useState<boolean>(true);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  const [isLoadingFreeBoards, setIsLoadingFreeBoards] = useState<boolean>(true);
  const [freeBoardError, setFreeBoardError] = useState<string | null>(null);

  // 1. 공지사항 로드
  const fetchNotices = async () => {
    setIsLoadingNotices(true);
    setNoticeError(null);
    try {
      const response = await apiClient.get<BoardListResponse>(
        `/api/v1/board/list?type=NOTICE&size=5&page=0`
      );
      const fetchedData = response.data.content || [];
      setNoticeData(
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
        setNoticeError(
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

  // 2. 자유게시판 로드
  const fetchFreeBoards = async () => {
    setIsLoadingFreeBoards(true);
    setFreeBoardError(null);
    try {
      const response = await apiClient.get<BoardListResponse>(
        `/api/v1/board/list?type=FREE&size=10&page=0`
      );
      const fetchedData = response.data.content || [];
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

  useEffect(() => {
    fetchNotices();
    fetchFreeBoards();
  }, []);

  // --- 렌더링 헬퍼 ---

  const renderNoticeSection = () => {
    if (isLoadingNotices) {
      return (
        <div className="loading-box">
          <Loader2 className="spinner" />
          <p>공지사항 로딩 중...</p>
        </div>
      );
    }
    if (noticeError) {
      return (
        <div className="error-box">
          <div className="error-content">
            <AlertCircle className="error-icon" />
            <p>공지사항 로드 실패: {noticeError}</p>
            <button onClick={fetchNotices} className="retry-btn">
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

  const renderFreeBoardSection = () => {
    if (isLoadingFreeBoards) {
      return (
        <div className="loading-box">
          <Loader2 className="spinner" />
          <p>자유게시판 로딩 중...</p>
        </div>
      );
    }
    if (freeBoardError) {
      return (
        <div className="error-box">
          <div className="error-content">
            <AlertCircle className="error-icon" />
            <p>자유게시판 로드 실패: {freeBoardError}</p>
            <button onClick={fetchFreeBoards} className="retry-btn">
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
    <MainLayout>
      <div className="home-container">
        <div className="home-grid">
          {/* 1. 공지사항 (전체 너비) */}
          {renderNoticeSection()}

          {/* 2. 오늘의 포켓몬 (절반 너비) */}
          <TodayPokemonSection />

          {/* 3. 자유게시판 (절반 너비) */}
          {renderFreeBoardSection()}

          {/* 4. 인기 샘플 TOP 3 (전체 너비) */}
          <BestSampleSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
