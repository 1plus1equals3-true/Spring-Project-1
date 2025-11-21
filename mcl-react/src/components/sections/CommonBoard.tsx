import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/defaultconfig";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/CommonBoard.css";

// 타입 정의
interface BoardItemResponse {
  idx: number;
  title: string;
  regdate: string | number[];
  authorNickname: string;
  hit: number;
  commentCount?: number;
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
  authorNickname: string;
  views: number;
}

interface CommonBoardProps {
  title: string;
  description: string;
  boardType: "NOTICE" | "FREE";
}

const CommonBoard: React.FC<CommonBoardProps> = ({
  title,
  description,
  boardType,
}) => {
  const navigate = useNavigate();

  const [data, setData] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // 날짜 변환 헬퍼 함수
  const parseDate = (dateInput: string | number[]): Date => {
    if (Array.isArray(dateInput)) {
      return new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0,
        dateInput[5] || 0
      );
    }
    return new Date(dateInput);
  };

  const fetchBoardData = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<BoardListResponse>(
        `${API_BASE_URL}/api/v1/board/list?type=${boardType}&size=10&page=${page}`
      );

      const responseData = response.data;

      const mappedData: BoardItem[] = (responseData.content || []).map(
        (item) => {
          const dateObj = item.regdate ? parseDate(item.regdate) : new Date();
          const formattedDate = dateObj
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\./g, ".")
            .slice(0, -1);

          return {
            id: item.idx,
            title: item.title,
            date: formattedDate,
            authorNickname: item.authorNickname || "관리자",
            views: item.hit || 0,
          };
        }
      );

      setData(mappedData);
      setTotalPages(responseData.totalPages);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as any)?.message ||
            "게시글을 불러오는데 실패했습니다."
        );
      } else {
        setError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData(currentPage);
  }, [boardType, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleRowClick = (id: number) => {
    navigate(`/board/${boardType.toLowerCase()}/${id}`);
  };

  // 로딩 상태
  if (loading && data.length === 0) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="error-container">
        <AlertCircle className="error-icon" size={40} />
        <p>{error}</p>
        <button
          onClick={() => fetchBoardData(currentPage)}
          className="retry-btn"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="board-container">
      {/* 헤더 섹션 */}
      <div className="board-header">
        <h1 className="board-title">{title}</h1>
        <p className="board-desc">{description}</p>
      </div>

      {/* 게시판 리스트 (테이블) */}
      <div className="board-card">
        <div className="table-responsive">
          <table className="board-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>번호</th>
                <th>제목</th>
                <th className="center" style={{ width: "120px" }}>
                  작성자
                </th>
                <th className="center" style={{ width: "120px" }}>
                  작성일
                </th>
                <th className="center" style={{ width: "80px" }}>
                  조회수
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} onClick={() => handleRowClick(item.id)}>
                    <td className="text-gray">{item.id}</td>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                    <td className="center text-gray">{item.authorNickname}</td>
                    <td className="center text-gray">{item.date}</td>
                    <td className="center text-gray">{item.views}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-message">
                    게시글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="page-btn"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="page-info">
          {currentPage + 1} / {totalPages === 0 ? 1 : totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="page-btn"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default CommonBoard;
