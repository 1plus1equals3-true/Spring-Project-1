// src/context/AuthContext.tsx

import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react"; // ⭐️ ReactNode를 type으로 임포트
import apiClient from "../api/apiClient";

// 1. Context 데이터 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  userNickname: string | null;
  login: (nickname: string) => void;
  logout: () => void;
}

// 2. Context 생성 및 초기값 설정
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider 컴포넌트 정의
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 초기 상태는 localStorage에서 가져옵니다.
  const [userNickname, setUserNickname] = useState<string | null>(
    localStorage.getItem("userNickname") // 닉네임이 있으면 로그인 상태로 간주
  );

  const isLoggedIn = !!userNickname; // 닉네임 존재 여부로 로그인 상태 판단

  // 4. 로그인 함수 (소셜 로그인 핸들러에서 호출됨)
  const login = (nickname: string) => {
    localStorage.setItem("userNickname", nickname);
    setUserNickname(nickname);
  };

  // 5. 로그아웃 함수 (핵심 로직)
  const logout = async () => {
    try {
      // 5-1. 서버에 로그아웃 API 요청 (쿠키 무효화 요청)
      // 백엔드가 200 OK 응답과 함께 Set-Cookie 헤더를 통해 쿠키를 만료시킬 것을 기대
      await apiClient.post("/api/v1/auth/logout");

      // 5-2. 클라이언트 상태 초기화
      localStorage.removeItem("userNickname");
      setUserNickname(null);

      alert("로그아웃되었습니다.");
    } catch (error) {
      console.error(
        "로그아웃 처리 중 오류 발생 (쿠키는 서버에서 삭제됨):",
        error
      );
      // API 오류가 나더라도, 클라이언트 측 상태는 반드시 초기화
      localStorage.removeItem("userNickname");
      setUserNickname(null);

      alert(
        "로그아웃 처리 중 오류가 발생했으나, 로컬 상태는 초기화되었습니다."
      );
    }

    // 5-3. 로그인 페이지로 리다이렉트 (App.tsx에 연결된 navigate가 없으므로 window.location 사용)
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userNickname, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. 커스텀 훅 정의
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내에서 사용되어야 합니다.");
  }
  return context;
};
