import React from "react";

interface BoardHeaderProps {
  title: string;
  description: string;
}

/**
 * 게시판 페이지의 상단 제목과 설명을 표시하는 공통 컴포넌트입니다.
 */
const BoardHeader: React.FC<BoardHeaderProps> = ({ title, description }) => {
  return (
    <>
      {/* CSS 스타일 블록: Tailwind 클래스 대체 */}
      <style>
        {`
          .board-header {
            /* mb-8 (margin-bottom: 2rem) */
            margin-bottom: 2rem; 
            /* pb-2 (padding-bottom: 0.5rem) */
            padding-bottom: 0.5rem; 
            /* border-b-2 border-gray-200 */
            border-bottom: 2px solid #e5e7eb; 
          }

          .board-header h1 {
            /* text-3xl (font-size: 1.875rem), font-bold (font-weight: 700) */
            font-size: 1.875rem;
            font-weight: 700;
            /* text-gray-800 (#1f2937), mb-1 (margin-bottom: 0.25rem) */
            color: #1f2937;
            margin-bottom: 0.25rem;
            line-height: 1.2;
          }

          .board-header p {
            /* text-base (font-size: 1rem), text-gray-500 (#6b7280) */
            font-size: 1rem;
            color: #6b7280;
            line-height: 1.5;
          }
        `}
      </style>

      {/* 컴포넌트 구조: 클래스명만 남기고 Tailwind 제거 */}
      <div className="board-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </>
  );
};

export default BoardHeader;
