// src/components/sections/PostListSection.tsx

import React from "react";
import { Link } from "react-router-dom";

interface PostItem {
  id: number;
  title: string;
  date: string;
}

interface PostListSectionProps {
  title: string;
  data: PostItem[];
  fullWidth?: boolean;
}

const PostFreeSection: React.FC<PostListSectionProps> = ({
  title,
  data,
  fullWidth = false,
}) => {
  // CSS 클래스 적용
  const itemClass = fullWidth ? "grid-item full-width" : "grid-item half-width";

  return (
    <div className={itemClass}>
      <h2>{title}</h2>
      <ul>
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.id}>
              <Link to={`/board/free/${item.id}`} className="title-link">
                {item.title}
              </Link>
              <span className="date">{item.date}</span>
            </li>
          ))
        ) : (
          <li>
            <p className="no-content" style={{ color: "#888" }}>
              표시할 내용이 없습니다.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default PostFreeSection;
