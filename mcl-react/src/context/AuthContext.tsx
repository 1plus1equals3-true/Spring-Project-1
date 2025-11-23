import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "../api/apiClient";

// 1. Context 데이터 타입 정의
export interface UserInfo {
  nickname: string;
  profileImageUrl: string | null;
  birth: string | null;
  grade: number;
  // 필요한 다른 사용자 정보 필드 추가 가능
}

interface AuthContextType {
  // 사용자 정보 (로그아웃 상태면 null)
  user: UserInfo | null;
  // 인증 상태 확인 중인지 여부 (초기 로딩 시 필수)
  isLoading: boolean;
  // 로그인 여부
  isLoggedIn: boolean;
  // 로그인 성공 후 정보 새로고침 강제 실행 함수 (예: 리다이렉션 후 호출)
  refreshUser: () => Promise<void>;
  // 로그아웃 함수
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserInfo>) => void;
}

// 2. Context 생성 및 초기값 설정
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider 컴포넌트 정의
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!user; // user 객체 존재 여부로 로그인 상태 판단

  const updateUser = (data: Partial<UserInfo>) => {
    setUser((prevUser) => {
      if (!prevUser) return null; // 사용자가 없으면 업데이트하지 않음
      return { ...prevUser, ...data }; // 이전 사용자 정보에 새 데이터를 병합
    });
  };

  const fetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<UserInfo>("/api/v1/auth/me");
      setUser(response.data);
    } catch (error) {
      // 401은 비로그인 상태이므로 에러가 아님 (정상 흐름)
      // 따라서 console.error를 찍지 않고 조용히 넘어갑니다.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 5. 로그인 성공 후 강제 새로고침 함수 (소셜 로그인 리다이렉트 후 유용)
  // 기존의 'login' 함수 역할을 대체합니다.
  const refreshUser = async () => {
    await fetchUserInfo();
  };

  // 6. 로그아웃 함수
  const logout = async () => {
    // 6-1. 클라이언트 상태부터 즉시 초기화하여 UX 개선
    setUser(null);
    setIsLoading(true);

    try {
      // 6-2. 서버에 로그아웃 API 요청 (쿠키 무효화 및 DB 처리)
      await apiClient.post("/api/v1/auth/logout");

      // 6-3. 성공적으로 서버 요청 완료 후 로딩 종료 및 리다이렉트
      setIsLoading(false);
    } catch (error) {
      console.error(
        "로그아웃 처리 중 오류 발생 (하지만 쿠키는 서버에서 삭제 요청됨):",
        error
      );
      // 오류 발생 시에도, 클라이언트 상태는 이미 null로 설정되어 있으므로 추가 조치 불필요
      setIsLoading(false);
    }

    // 6-4. 로그인 페이지로 리다이렉트 (프론트엔드 라우터에 맞게 수정 필요)
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        refreshUser,
        logout,
        updateUser,
      }}
    >
      {/* ⭐️ 로딩 중에는 아무것도 렌더링하지 않거나, 스피너를 보여줄 수 있습니다. */}
      {isLoading ? <div>인증 상태 확인 중...</div> : children}
    </AuthContext.Provider>
  );
};

// 7. 커스텀 훅 정의
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내에서 사용되어야 합니다.");
  }
  return context;
};
