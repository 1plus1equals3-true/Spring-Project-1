// src/components/sections/ReviewCardSection.tsx

import React from "react";

interface ReviewCard {
  id: number;
  rank: string;
  title: string;
  info: string;
}

interface ReviewCardSectionProps {
  data: ReviewCard[];
}

const ReviewCardSection: React.FC<ReviewCardSectionProps> = ({ data }) => (
  <div className="grid-item full-width">
    <h2>🏆 베스트 컬렉션 리뷰</h2>
    <div className="review-card-list">
      {data.length > 0 ? (
        data.map((card) => (
          <div key={card.id} className="review-card">
            {/* 실제 구현 시 이미지나 썸네일로 대체 */}
            <div className="review-card-img">{card.rank}</div>
            <h3>{card.title}</h3>
            <p>{card.info}</p>
          </div>
        ))
      ) : (
        <p className="no-content" style={{ color: "#888", padding: "10px" }}>
          표시할 베스트 리뷰가 없습니다.
        </p>
      )}
    </div>
  </div>
);

export default ReviewCardSection;
