import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/defaultconfig";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 전역 변수
let isRefreshing = false;
let failedQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 401 에러이고, 아직 재시도하지 않은 요청이라면 무조건 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 재발급 중이라면 큐에 담고 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ⭐️ 재발급 요청
        // post 데이터가 없다면 null, 옵션은 세 번째 인자
        await axios.post(`${API_BASE_URL}/api/v1/auth/reissue`, null, {
          withCredentials: true, // 쿠키 전송 필수
        });

        // 재발급 성공! 큐 처리 및 원래 요청 재시도
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 재발급 실패 (Refresh Token 만료 등)
        processQueue(refreshError, null);

        // ⭐️ 선택 사항: 재발급 실패 시 로그인 페이지로 이동시키거나,
        // AuthContext에서 상태를 비우도록 처리
        console.log("Refresh Token 만료 혹은 없음, 로그아웃 처리 필요");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
