// src/api/apiClient.ts (TypeScript 기준)

import axios from "axios";

// 1. 기본 Axios 인스턴스 생성
// 백엔드 서버의 기본 URL을 설정합니다.
const API_BASE_URL = "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 설정 (가장 중요)
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 저장된 JWT 토큰을 가져옵니다.
    const token = localStorage.getItem("accessToken");

    // 토큰이 존재하면 Authorization 헤더에 Bearer 스키마를 사용하여 추가합니다.
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
